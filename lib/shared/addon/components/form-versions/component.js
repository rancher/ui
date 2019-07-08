import Component from '@ember/component';
import layout from './template';
import { get, set, computed, setProperties } from '@ember/object';
import C from 'shared/utils/constants';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { satisfies, maxSatisfying, coerceVersion } from 'shared/utils/parse-version';
import { sortVersions } from 'shared/utils/sort';
import { scheduleOnce } from '@ember/runloop';
import { lt, gt }  from 'semver';

export default Component.extend({
  settings: service(),
  intl:     service(),

  layout,

  cluster:                null,
  versionChoices:         null,
  versions:               null,
  initialVersion:         null,
  editing:                false,
  value:                  null,

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
      defaultK8sVersionRange, versions, supportedVersionsRange, editing, initialVersion, defaultK8sVersion
    } = this;
    const maxVersion = maxSatisfying(versions, defaultK8sVersionRange);

    if (!editing && defaultK8sVersionRange) {
      if (this.value) {
        if ( maxVersion && !versions.includes(get(this, 'value')) ) {
          set(this, 'value', maxVersion);
        }
      }
    }

    let out = versions;

    if (initialVersion) {
      if ( !out.includes(initialVersion) && editing ) {
        out.unshift(initialVersion);
      }
    } else {
      initialVersion = defaultK8sVersion;
    }

    set(this, 'versionChoices', sortVersions(out).reverse().map((v) => {
      let label = v;
      let out   = null;

      const version = coerceVersion(v)

      if (gt(version, coerceVersion(maxVersion))) {
        label = `${ v } ${ this.intl.t('formVersions.experimental') }`
      }

      out = {
        label,
        value: v
      };

      if ((supportedVersionsRange && !satisfies(version, supportedVersionsRange) ) || (editing && initialVersion && lt(version, coerceVersion(initialVersion)))) {
        if (!gt(version, coerceVersion(maxVersion))) {
          setProperties(out, {
            disabled: true,
            label:    `${ label } ${ this.intl.t('formVersions.unsupported') }`,
          });
        }
      }

      return out;
    }));
  },
});
