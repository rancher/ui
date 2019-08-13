import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import C from 'shared/utils/constants';
import { inject as service } from '@ember/service';
import { alias, equal } from '@ember/object/computed';
import { satisfies, maxSatisfying, coerceVersion } from 'shared/utils/parse-version';
import { sortVersions } from 'shared/utils/sort';
import { scheduleOnce } from '@ember/runloop';
import { lt, gt, minor }  from 'semver';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  settings: service(),
  intl:     service(),

  layout,

  cluster:                null,
  versionChoices:         null,
  versions:               null,
  initialVersion:         null,
  disabled:               false,
  value:                  null,
  mode:                   'new',
  editing:                equal('mode', 'edit'),
  isView:                 equal('mode', 'view'),

  defaultK8sVersionRange: alias(`settings.${ C.SETTING.VERSION_SYSTEM_K8S_DEFAULT_RANGE }`),
  supportedVersionsRange: alias(`settings.${ C.SETTING.VERSION_K8S_SUPPORTED_RANGE }`),
  defaultK8sVersion:      alias(`settings.${ C.SETTING.VERSION_RKE_K8S_DEFAULT }`),

  init() {
    this._super(...arguments);

    scheduleOnce('afterRender', () => {
      this.initVersions();
    });
  },

  isRke: computed('cluster', function() {
    const { cluster } = this;

    if (get(cluster, 'rancherKubernetesEngineConfig')) {
      return true;
    }

    return false;
  }),

  initVersions() {
    let {
      defaultK8sVersionRange,
      versions,
      supportedVersionsRange,
      editing,
      initialVersion,
      defaultK8sVersion,
      applyClusterTemplate     = false,
      clusterTemplateQuestions = [],
    } = this;

    let out = versions;

    if (initialVersion) {
      if ( !out.includes(initialVersion) && editing ) {
        out.unshift(initialVersion);
      }
    } else {
      initialVersion = defaultK8sVersion;
    }

    let maxVersion = maxSatisfying(versions, defaultK8sVersionRange);

    if ( applyClusterTemplate ) {
      var overrideMatch = ( clusterTemplateQuestions || [] ).findBy('variable', 'rancherKubernetesEngineConfig.kubernetesVersion');

      if (overrideMatch) {
        if (isEmpty(overrideMatch.satisfies) && initialVersion.endsWith('.x')) {
          // the template creator lets them override this but the initial version is a dot x so we should choose the biggest version in the .x range
          maxVersion = maxSatisfying(versions, initialVersion);
        } else {
          if (overrideMatch.satisfies) {
            supportedVersionsRange = overrideMatch.satisfies;
          }

          maxVersion = maxSatisfying(versions, supportedVersionsRange);
        }
      }
    }

    let mappedVersions = sortVersions(out).reverse().map((v) => {
      let label = v;
      let out   = null;

      const version = coerceVersion(v)

      if (!label.startsWith('v')) {
        label = `v${ label }`;
      }

      if (satisfies(version, supportedVersionsRange)) {
        if (editing && lt(version, coerceVersion(initialVersion))) {
          if (minor(version) < minor(initialVersion) ) {
            out = {
              disabled: true,
              label:    `${ label } ${ this.intl.t('formVersions.unsupported') }`,
              value:    v
            };
          } else {
            out = {
              label,
              value: v
            };
          }
        } else {
          out = {
            label,
            value: v
          };
        }
      } else {
        if (gt(version, coerceVersion(maxVersion))) {
          if (overrideMatch && !isEmpty(overrideMatch.satisfies)) {
            out = {
              disabled: true,
              label:    `${ label } ${ this.intl.t('formVersions.unsupported') }`,
              value:    v
            };
          } else {
            out = {
              experimental: true,
              label:        `${ label } ${ this.intl.t('formVersions.experimental') }`,
              value:        v
            };
          }
        } else if (lt(version, coerceVersion(maxVersion))) {
          out = {
            disabled: true,
            label:    `${ label } ${ this.intl.t('formVersions.unsupported') }`,
            value:    v
          };
        }
      }

      return out;
    });

    if (( !editing ) && defaultK8sVersionRange) {
      if (this.value) {
        if ( maxVersion && !mappedVersions.findBy('value', get(this, 'value')) ) {
          set(this, 'value', maxVersion);
        }
      }
    }

    set(this, 'versionChoices', mappedVersions);
  },
});
