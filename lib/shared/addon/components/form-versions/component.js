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
  showNotAllowed:         false,
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
      showNotAllowed,
      applyClusterTemplate     = false,
      clusterTemplateCreate    = false,
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

    let initialWithoutX = initialVersion.endsWith('.x') ? initialVersion.replace(/x$/, '0') : initialVersion;
    let maxVersion      = maxSatisfying(versions, defaultK8sVersionRange);

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

    // if we're not consuming or creating a cluster template we should use the default translation for the label
    if (!applyClusterTemplate && !clusterTemplateCreate) {
      showNotAllowed = false;
    }

    out = [
      ...sortVersions(out.filter((v) => v.endsWith('.x'))).reverse(),
      ...sortVersions(out.filter((v) => !v.endsWith('.x'))).reverse(),
    ];

    let mappedVersions = out.map((v) => {
      let label = v;
      let out   = null;

      const version = coerceVersion(v)

      if (!label.startsWith('v')) {
        label = `v${ label }`;
      }

      if ( label.endsWith('.x') ) {
        label = this.intl.t('formVersions.dotx', { minor: label.replace(/\.x$/, '') });
      }

      if (satisfies(version, supportedVersionsRange)) {
        if (editing && lt(version, coerceVersion(initialWithoutX))) {
          if (minor(version) < minor(coerceVersion(initialWithoutX)) ) {
            out = {
              disabled: true,
              label:    `${ label } ${ this.intl.t('formVersions.downgrade') }`,
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
        const suffix = ( showNotAllowed ? 'formVersions.notallowed' : 'formVersions.unsupported' );

        if (gt(version, coerceVersion(maxVersion))) {
          if (overrideMatch && !isEmpty(overrideMatch.satisfies)) {
            out = {
              disabled: true,
              label:    `${ label } ${ this.intl.t(suffix) }`,
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
            label:    `${ label } ${ this.intl.t(suffix) }`,
            value:    v
          };
        }
      }

      return out;
    });

    if (( !editing ) && defaultK8sVersionRange && this.value) {
      if (this.value.endsWith('.x')) {
        set(this, 'value', this.intl.t('formVersions.dotx', { minor: this.value.replace(/\.x$/, '') }));
      } else {
        if ( maxVersion && !mappedVersions.findBy('value', get(this, 'value')) ) {
          set(this, 'value', maxVersion);
        }
      }
    }

    set(this, 'versionChoices', mappedVersions);
  },
});
