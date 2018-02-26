import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import { alias } from '@ember/object/computed';
import layout from './template';

const MEMBER_CONFIG = {
  type: 'clusterRoleTemplateBinding',
};

export default Component.extend(ViewNewEdit, ChildHook, {
  layout,
  globalStore: service(),
  intl: service(),
  access: service(),

  cluster: alias('model.cluster'),
  originalCluster: alias('model.originalCluster'),
  primaryResource: alias('model.cluster'),

  step: 1,
  initialProvider: null,
  memberConfig: MEMBER_CONFIG,

  init() {
    this._super(...arguments);

    // On edit pass in initialProvider, for create just set provider directly
    const initialProvider = get(this, 'initialProvider');
    if ( initialProvider ) {
      set(this, 'provider', initialProvider);
    }

//    if ( get(this, 'cluster.id') && initialProvider ){
//      set(this,'step', 2);
//    }
  },

  actions: {
    clickNext() {
      this.$('BUTTON[type="submit"]').click();
    },

    close() {
      this.sendAction('close');
    },
  },

  providerChoices: computed(
  'isEdit',
  'cluster.rancherKubernetesEngineConfig',
  'nodeDrivers.[]',
  'intl.locale',
  function() {
    const intl = get(this, 'intl');

    let out = [
      {name: 'googlegke',       driver: 'googlegke'},
      {name: 'amazoneks',       driver: 'amazoneks'},
      {name: 'azureaks',        driver: 'azureaks'},
    ];

    get(this, 'model.nodeDrivers').filterBy('active',true).sortBy('name').forEach((driver) => {
      const name = get(driver, 'name');
      const hasUi = get(driver, 'hasUi');

      out.push({
        name: name,
        driver: 'rke',
        nodeComponent: hasUi ? name : 'generic',
        nodeWhich: name,
      });
    }),

    out.push({name: 'custom',          driver: 'rke', nodeWhich: 'custom', preSave: true});
    out.push({name: 'import',          driver: 'import', preSave: true});

    out.forEach((driver) => {
      const key = `clusterNew.${driver.name}.label`;
      if ( !get(driver,'displayName') && intl.exists(key) ) {
        set(driver, 'displayName', intl.t(key));
      }
    });

    if ( get(this, 'isEdit') && get(this, 'cluster.rancherKubernetesEngineConfig') ) {
      out = out.filterBy('driver','rke');
    }

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
        nodeWhich: entry.nodeWhich,
        preSave: !!entry.preSave,
      };
    }
  }),

  didSave() {
    const originalCluster = get(this, 'cluster');
    return originalCluster.waitForCondition('BackingNamespaceCreated').then(() => {
      return this.applyHooks().then(() => {
        const clone = originalCluster.clone();
        set(this, 'cluster', clone);
        set(this, 'originalCluster', originalCluster);
        return clone;
      });
    });
  },

  doneSaving() {
    if ( get(this, 'step') === 1 && get(this, 'driverInfo.preSave') ) {
      set(this, 'step', 2);
      set(this, 'initialProvider', get(this, 'provider'));
    } else {
      this.sendAction('close');
    }
  },
});
