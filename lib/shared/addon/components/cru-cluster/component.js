import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import { alias } from '@ember/object/computed';
import { loadStylesheet, proxifyUrl } from 'shared/utils/load-script';
import layout from './template';
import { isEmpty } from '@ember/utils';

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
  allClusters: alias('model.allClusters'),

  step: 1,
  initialProvider: null,
  memberConfig: MEMBER_CONFIG,
  newCluster: false,
  needReloadSchema: false,
  reloadingSchema: false,
  schemaReloaded: false,

  init() {
    this._super(...arguments);

    // On edit pass in initialProvider, for create just set provider directly
    const initialProvider = get(this, 'initialProvider');
    if ( initialProvider ) {
      set(this, 'provider', initialProvider);
    }

    if ( isEmpty(get(this, 'cluster.id')) ){
      set(this, 'newCluster', true);
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
  'schemaReloaded',
  'intl.locale',
  function() {
    const intl = get(this, 'intl');

    let out = [
      {name: 'googlegke',       driver: 'googlegke'},
      {name: 'amazoneks',       driver: 'amazoneks'},
      {name: 'azureaks',        driver: 'azureaks'},
    ];

    get(this, 'model.nodeDrivers').filterBy('state','active').sortBy('name').forEach((driver) => {
      const name = get(driver, 'name');
      const hasUi = get(driver, 'hasUi');
      const hasIcon = get(driver, 'hasBuiltinIconOnly');
      const uiUrl = get(driver, 'uiUrl');

      if( uiUrl ) {
        const cssUrl = proxifyUrl(uiUrl.replace(/\.js$/,'.css'), get(this, 'app.proxyEndpoint'));
        loadStylesheet(cssUrl, `driver-ui-css-${name}`);
      }

      const configName = `${name}Config`;
      const driverSchema = get(this, 'globalStore').getById('schema', configName.toLowerCase());

      if ( driverSchema ) {
        out.push({
          name: name,
          driver: 'rke',
          genericIcon: !hasUi && !hasIcon,
          nodeComponent: hasUi ? name : 'generic',
          nodeWhich: name,
        });
      } else {
        set(this, 'needReloadSchema', true);
      }
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

  reloadSchema: observer('needReloadSchema', function() {
    if ( !get(this, 'reloadingSchema') && get(this, 'needReloadSchema') ) {
      set(this, 'reloadingSchema', true);
      get(this, 'globalStore').findAll('schema', {
        url: '/v3/schemas',
        forceReload: true
      }).then(() => {
        set(this, 'schemaReloaded', true);
        set(this, 'reloadingSchema', false);
      });
    }
  }),

  providerGroups: computed('providerChoices.@each.{name,driver,nodeComponent,nodeWhich,preSave}', function() {
    const choices = get(this, 'providerChoices');
    const group = [];
    let groupIndex = 0;
    choices.forEach((item, index) => {
      if (index % 6 === 0) {
        group.push([item]);
        groupIndex++;
      } else {
        group[groupIndex - 1].push(item);
      }
    });

    return group;
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

  validate() {
    const intl = get(this, 'intl');
    const pr = get(this, 'primaryResource');
    let errors = pr.validationErrors() || [];

    if ( !get(this, 'cluster.name') ) {
      errors.push(intl.t('clusterNew.name.req'));
    } else if ( get(this, 'allClusters').findBy('name', get(this, 'cluster.name')) ) {
      errors.push(intl.t('clusterNew.name.exists'));
    }
    
    errors = errors.uniq();

    if (get(errors, 'length')) {
      set(this, 'errors', errors);
      return false;
    }

    set(this, 'errors', null);
    return true;
  },

  didSave() {
    const originalCluster = get(this, 'cluster');
    return originalCluster.waitForCondition('InitialRolesPopulated').then(() => {
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
