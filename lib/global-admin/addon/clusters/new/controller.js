import Controller from '@ember/controller';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  globalStore: service(),
  intl: service(),

  provider: 'googlegke',
  showProviders: true,

  queryParams: ['provider'],

  actions: {
    hideProviders() {
      set(this, 'showProviders', false);
    },

    close() {
      this.send('goToPrevious', 'global-admin.clusters.index');
    },
  },

  providerChoices: computed('nodeDrivers.[]','intl.locale', function() {
    const intl = get(this, 'intl');

    // @TODO settings to disable gke/eks/aks/import/custom, nodeDrivers for other clouds
    const out = [
      {name: 'googlegke',       driver: 'googlegke'},
      {name: 'amazoneks',       driver: 'amazoneks'},
      {name: 'azureaks',        driver: 'azureaks'},
      {name: 'digitalocean',    driver: 'rke', nodeComponent: 'digitalocean'},
      {name: 'vmwarevcloudair', driver: 'rke', nodeComponent: 'generic', nodeWhich: 'vmwarevcloudair'},
      {name: 'custom',          driver: 'rke', nodeWhich: 'custom'},
      {name: 'import',          driver: 'import'},
    ];

    out.forEach((driver) => {
      const key = `clusterNew.${driver.name}.label`;
      if ( !get(driver,'displayName') && intl.exists(key) ) {
        set(driver, 'displayName', intl.t(key));
      }
    });

    return out;
  }),

  driverInfo: computed('provider', function() {
    const name = get(this, 'provider');
    const choices = get(this, 'providerChoices');
    const entry = choices.findBy('name', name);
    if ( entry ) {
      return {
        name: entry.name,
        driverComponent: `cluster-driver/driver-${entry.driver}`,
        nodeComponent: `node-driver/driver-${entry.nodeComponent}`,
        nodeWhich: entry.nodeWhich,
      };
    }
  }),
});
