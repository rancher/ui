import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';
import Semver from 'semver';
import { sortVersions } from 'shared/utils/sort';

export default Component.extend({
  releaseVersions: service(),
  intl:            service(),

  layout,

  editing:     false,
  configField: 'k3sConfig',

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

  allVersions: computed('releaseVersions.allVersions.[]', function() {
    const currentVersion = get(this, `config.kubernetesVersion`);
    const versionsMapped = [];
    let allVersions    = this.releaseVersions.allVersions || [];

    if (!allVersions.includes(currentVersion)) {
      allVersions.unshift(currentVersion);
    }

    allVersions = [...sortVersions(allVersions).reverse()];

    allVersions.forEach((v) => {
      if (Semver.gte(v, currentVersion)) {
        versionsMapped.pushObject({
          value: v,
          label: v,
        });
      }
    });

    return versionsMapped;
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
