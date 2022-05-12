import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';
import Semver from 'semver';
import { satisfies } from 'shared/utils/parse-version';
import { sortVersions } from 'shared/utils/sort';
import C from 'shared/utils/constants';
import { alias } from '@ember/object/computed';
import { compare } from 'shared/utils/parse-version';

export default Component.extend({
  settings:        service(),
  releaseVersions: service(),
  intl:            service(),

  layout,

  editing:     false,
  configField: 'k3sConfig',

  supportedK8sVersionRange: alias(`settings.${ C.SETTING.VERSION_K8S_SUPPORTED_RANGE }`),

  config: computed('cluster.{k3sConfig,rke2Config}', 'configField', function() {
    return get(this, `cluster.${ this.configField }`);
  }),

  showAce: computed('cluster.{internal,k3sConfig,rancherKubernetesEngineConfig,rke2Config,rke2config}', function() {
    // Hide on the local cluster
    if ( get(this, 'cluster.internal') ) {
      return false;
    }

    return !!get(this, 'cluster.rancherKubernetesEngineConfig') ||
           !!get(this, 'cluster.k3sConfig') ||
           !!get(this, 'cluster.rke2Config') ||
           false;
  }),

  upgradeStrategy: computed('config.{k3supgradeStrategy,rke2upgradeStrategy}', 'configField', function() {
    const { configField } = this;
    const upgradeStrategyPath = configField === 'k3sConfig' ? 'k3supgradeStrategy' : 'rke2upgradeStrategy';

    return get(this.config, upgradeStrategyPath);
  }),

  serverConcurrency: computed('upgradeStrategy.serverConcurrency', {
    get() {
      return get(this, 'upgradeStrategy.serverConcurrency');
    },

    set(key, value) {
      set(this, 'upgradeStrategy.serverConcurrency', this.coerceToInt(value));

      return value;
    }
  }),

  workerConcurrency: computed('upgradeStrategy.workerConcurrency', {
    get() {
      return get(this, 'upgradeStrategy.workerConcurrency');
    },

    set(key, value) {
      set(this, 'upgradeStrategy.workerConcurrency', this.coerceToInt(value));

      return value;
    }
  }),

  allVersions: computed('releaseVersions.allVersions.[]', 'supportedK8sVersionRange', function() {
    let currentVersion = get(this, `config.kubernetesVersion`);
    const versionsMapped = [];
    let allVersions    = this.releaseVersions.allVersions || [];

    if (!allVersions.includes(currentVersion)) {
      allVersions.unshift(currentVersion);
    }

    allVersions = [...sortVersions(allVersions).reverse()];

    allVersions.forEach((v) => {
      let experimental = false

      if (this.supportedK8sVersionRange) {
        experimental = !satisfies(v, this.supportedK8sVersionRange);
      }

      if (Semver.gte(v, currentVersion)) {
        versionsMapped.pushObject({
          value: v,
          label: `${ v } ${ experimental ? this.intl.t('generic.experimental') : '' }`,
        });
      }
    });

    const includeOnlyLatestMinorVersions = () => {
      let result = []
      let minorVersions = {}

      for (let i = 0; i < versionsMapped.length; i++) {
        const version = versionsMapped[i].value;
        const versionPieces = version.split('.')
        const minorVersion = versionPieces[0] + versionPieces[1];

        if (!minorVersions[minorVersion] || compare(minorVersions[minorVersion].value, version) < 0) {
          minorVersions[minorVersion] = versionsMapped[i];
        }
      }
      for (const minorVersion in minorVersions) {
        // Don't add the version if it would
        // duplicate the current version
        if (minorVersions[minorVersion].value !== currentVersion) {
          result.push(minorVersions[minorVersion])
        }
      }

      // Always include the current version so that
      // it shows as the default value in the form
      result.push({
        label: currentVersion,
        value: currentVersion
      });

      return result;
    }

    const onlyLatestMinorVersions = includeOnlyLatestMinorVersions();

    return onlyLatestMinorVersions;
  }),

  coerceToInt(value) {
    let errors;
    let coerced = value;

    errors = set(this, 'errors', []);

    coerced = parseInt(value, 10);

    if (isNaN(coerced)) {
      errors.push(this.intl.t('managedImportClusterInfo.error.int'));

      set(this, 'errors', errors);

      return value;
    }

    return coerced;
  },

});
