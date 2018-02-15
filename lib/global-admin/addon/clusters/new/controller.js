import Controller from '@ember/controller';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import { alias } from '@ember/object/computed';

const MEMBER_CONFIG = {
  type: 'clusterRoleTemplateBinding',
};

export default Controller.extend(ViewNewEdit, ChildHook, {
  globalStore: service(),
  intl: service(),

  cluster: alias('model.cluster'),
  primaryResource: alias('model.cluster'),

  step: 1,
  provider: 'googlegke',
  memberConfig: MEMBER_CONFIG,

  queryParams: ['provider'],

  actions: {
    clickNext() {
      this.$('BUTTON[type="submit"]').click();
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
    ];

    get(this, 'model.nodeDrivers').filterBy('active',true).forEach((driver) => { 
      const name = get(driver, 'name');
      const hasUi = get(driver, 'hasUi');

      out.push({
        name: name,
        driver: 'rke',
        nodeComponent: hasUi ? name : 'generic',
        nodeWhich: name,
      });
    }),

    out.push({name: 'custom',          driver: 'rke', nodeWhich: 'custom'});
    out.push({name: 'import',          driver: 'import'});

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

  willSave() {
    const cluster = get(this, 'cluster');
    const field = get(this, 'configField');
    cluster.clearProvidersExcept(field);
    return this._super(...arguments);
  },

  didSave() {
    const originalCluster = get(this, 'cluster');
    return originalCluster.waitForCondition('BackingNamespaceCreated').then(() => {
      return this.applyHooks().then(() => {
        const clone = originalCluster.clone();
        set(this, 'cluster', clone);
        return clone;
      });
    });
  },

  doneSaving() {
    set(this, 'step', 2);
  },
});
