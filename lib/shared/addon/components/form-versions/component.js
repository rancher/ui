import Component from '@ember/component';
import layout from './template';
import { get, set, computed, observer } from '@ember/object';
import C from 'shared/utils/constants';
import { inject as service } from '@ember/service';
import { alias, equal } from '@ember/object/computed';
import { satisfies, maxSatisfying, coerceVersion } from 'shared/utils/parse-version';
import { sortVersions } from 'shared/utils/sort';
import { scheduleOnce } from '@ember/runloop';
import { lt, gt, minor }  from 'semver';
import { isEmpty } from '@ember/utils';
import { on } from '@ember/object/evented';

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
  supportedVersionsRange: null,
  editing:                equal('mode', 'edit'),
  isView:                 equal('mode', 'view'),

  defaultK8sVersionRange: alias(`settings.${ C.SETTING.VERSION_SYSTEM_K8S_DEFAULT_RANGE }`),
  defaultK8sVersion:      alias(`settings.${ C.SETTING.VERSION_RKE_K8S_DEFAULT }`),

  shouldRecomputInitalValues: on('init', observer('cluster.clusterTemplateRevisionId', function() {
    scheduleOnce('afterRender', () => {
      // we should set this everytime. we can potentially override it based on
      // satisfies overrides, so if we change templates while launching
      // a cluster from a satisfies to a non-satisfies override we should set
      // it back to the system setting
      set(this, 'supportedVersionsRange', get(this, `settings.${ C.SETTING.VERSION_K8S_SUPPORTED_RANGE }`));

      this.initVersions();
    });
  })),

  isRke: computed('cluster', function() {
    const { cluster } = this;

    if (get(cluster, 'rancherKubernetesEngineConfig')) {
      return true;
    }

    return false;
  }),

  k8sVersionOverride: computed('clusterTemplateQuestions.@each.variable', function() {
    return ( this.clusterTemplateQuestions || [] ).findBy('variable', 'rancherKubernetesEngineConfig.kubernetesVersion') || {};
  }),

  getLabelSuffixKey: computed('showNotAllowed', function() {
    let {
      applyClusterTemplate  = false,
      clusterTemplateCreate = false,
      showNotAllowed,
    }          = this;
    let suffix = ( showNotAllowed ? 'formVersions.notallowed' : 'formVersions.unsupported' );

    // if we're not consuming or creating a cluster template we should use the default translation for the label
    if (!applyClusterTemplate && !clusterTemplateCreate) {
      suffix = 'formVersions.unsupported';
    }

    return suffix;
  }),

  initVersions() {
    let {
      versions,
      editing,
      initialVersion,
      defaultK8sVersion,
      k8sVersionOverride,
      intl,
      getLabelSuffixKey: suffix,
    } = this;

    let clonedVersions = versions.slice();

    if (isEmpty(initialVersion)) {
      initialVersion = defaultK8sVersion;
    }

    if ( editing && !clonedVersions.includes(initialVersion) ) {
      clonedVersions.unshift(initialVersion);
    }

    let initialWithoutX = initialVersion.endsWith('.x') ? initialVersion.replace(/x$/, '0') : initialVersion;
    let maxVersion      = this.getMaxVersion(initialVersion, clonedVersions);

    clonedVersions = [
      ...sortVersions(clonedVersions.filter((v) => v.endsWith('.x'))).reverse(),
      ...sortVersions(clonedVersions.filter((v) => !v.endsWith('.x'))).reverse(),
    ];

    let mappedVersions = clonedVersions.map((v) => {
      let label            = this.parseLabelFromVersion(v);
      let disabled         = false;
      let experimental     = false;

      const version        = coerceVersion(v)

      let versionSatisfies = satisfies(version, this.supportedVersionsRange);

      if (versionSatisfies) {
        if (editing && isCurrentVersionLessThanInitial() ) {
          disabled = true;
          label    = `${ label } ${ intl.t('formVersions.downgrade') }`;
        }
      } else {
        if (gt(version, coerceVersion(maxVersion))) {
          if (isEmpty(k8sVersionOverride.satisfies)) {
            if (!satisfies(coerceVersion(v), '>=1.16 <1.17')) {
              experimental = true;
              label        = `${ label } ${ intl.t('formVersions.experimental') }`;
            }
          } else {
            disabled = true;
            label    = `${ label } ${ intl.t(suffix) }`;
          }
        } else if (lt(version, coerceVersion(maxVersion))) {
          disabled = true;
          label    = `${ label } ${ intl.t(suffix) }`;
        }
      }

      function isCurrentVersionLessThanInitial() {
        if (lt(version, coerceVersion(initialWithoutX)) && minor(version) <= minor(coerceVersion(initialWithoutX))) {
          return true;
        }

        return false;
      }

      return {
        disabled,
        experimental,
        label,
        value: v
      };
    });

    set(this, 'versionChoices', mappedVersions);

    this.initValue(initialWithoutX, maxVersion);
  },

  initValue(initialVersion, maxVersion) {
    let {
      editing,
      value,
      k8sVersionOverride,
      applyClusterTemplate,
      intl,
      versionChoices: mappedVersions,
    } = this;
    let valueIsPatchVersion          = false;
    let initialVersionDoesSatisfy = true;

    if (isEmpty(value)) {
      value = initialVersion;
    }

    if (value.endsWith('.x')) {
      valueIsPatchVersion = true;
    }

    if (!isEmpty(k8sVersionOverride.satisfies) && !satisfies(initialVersion, k8sVersionOverride.satisfies)) {
      initialVersionDoesSatisfy = false;
    }

    if (editing) {
      if (applyClusterTemplate) {
        if (initialVersionDoesSatisfy) {
          value = initialVersion;
        } else {
          value = maxVersion;
        }
      }
    } else {
      if (applyClusterTemplate && !mappedVersions.findBy('value', value)) {
        value = maxVersion;
      } else {
        if (valueIsPatchVersion) {
          value = intl.t('formVersions.dotx', { minor: value.replace(/\.x$/, '') });
        }
      }
    }

    set(this, 'value', value);
  },

  getMaxVersion(initialVersion, versions) {
    let {
      applyClusterTemplate,
      defaultK8sVersionRange,
      supportedVersionsRange,
      k8sVersionOverride,
    } = this;
    let maxVersion      = maxSatisfying(versions, defaultK8sVersionRange);

    if ( applyClusterTemplate ) {
      if (isEmpty(k8sVersionOverride.satisfies) && initialVersion.endsWith('.x')) {
        // the template creator lets them override this but the initial version is a dot x so we should choose the biggest version in the .x range
        maxVersion = maxSatisfying(versions, initialVersion);
      } else {
        if (k8sVersionOverride.satisfies) {
          supportedVersionsRange = set(this, 'supportedVersionsRange', k8sVersionOverride.satisfies);
        }

        maxVersion = maxSatisfying(versions, supportedVersionsRange);
      }
    }

    return maxVersion;
  },

  parseLabelFromVersion(version) {
    let { intl } = this;
    let label = version;

    if (!label.startsWith('v')) {
      label = `v${ label }`;
    }

    if ( label.endsWith('.x') ) {
      label = intl.t('formVersions.dotx', { minor: label.replace(/\.x$/, '') });
    }

    return label;
  },

});
