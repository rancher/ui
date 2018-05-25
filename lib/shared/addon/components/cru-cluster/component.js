import Component from '@ember/component';
import { get, set, computed, observer, setProperties } from '@ember/object';
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
  globalStore:      service(),
  intl:             service(),
  access:           service(),

  cluster:          alias('model.cluster'),
  originalCluster:  alias('model.originalCluster'),
  primaryResource:  alias('model.cluster'),

  step:             1,
  initialProvider:  null,
  memberConfig:     MEMBER_CONFIG,
  newCluster:       false,
  needReloadSchema: false,
  reloadingSchema:  false,
  schemaReloaded:   false,

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
      {name: 'googlegke', driver: 'googlegke'},
      {name: 'amazoneks', driver: 'amazoneks'},
      {name: 'azureaks',  driver: 'azureaks'},
    ];

    get(this, 'model.nodeDrivers').filterBy('state','active').sortBy('name').forEach((driver) => {

      const name         = get(driver, 'name');
      const hasUi        = get(driver, 'hasUi');
      const hasIcon      = get(driver, 'hasBuiltinIconOnly');
      const uiUrl        = get(driver, 'uiUrl');
      const configName   = `${name}Config`;
      const driverSchema = get(this, 'globalStore').getById('schema', configName.toLowerCase());

      if( uiUrl ) {

        const cssUrl = proxifyUrl(uiUrl.replace(/\.js$/,'.css'), get(this, 'app.proxyEndpoint'));

        loadStylesheet(cssUrl, `driver-ui-css-${name}`);
      }


      if ( driverSchema ) {

        out.push({
          name:          name,
          driver:        'rke',
          genericIcon:   !hasUi && !hasIcon,
          nodeComponent: hasUi ? name : 'generic',
          nodeWhich:     name,
        });

      } else {

        set(this, 'needReloadSchema', true);

      }

    }),

    out.push({
      name:      'custom',
      driver:    'rke',
      nodeWhich: 'custom',
      preSave:   true
    });

    out.push({
      name:    'import',
      driver:  'import',
      preSave: true
    });

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

        setProperties({
          schemaReloaded: true,
          reloadingSchema: false
        });

      });
    }
  }),

  providerGroups: computed('providerChoices.@each.{name,driver,nodeComponent,nodeWhich,preSave}', function() {

    const choices     = get(this, 'providerChoices');
    const rkeGroup    = [];
    const cloudGroup  = [];
    const customGroup = [];
    const emportGroup = [];

    choices.forEach((item) => {

      if (get(item, 'driver') === 'rke' && get(item, 'name') !== 'customGroup') {

        rkeGroup.pushObject(item);

      } else if (get(item, 'driver') === 'import') {

        emportGroup.pushObject(item);

      } else if (get(item, 'name') === 'customGroup') {

        customGroup.pushObject(item);

      } else {

        cloudGroup.pushObject(item);

      }

    });

    return {
      rkeGroup,
      cloudGroup,
      customGroup,
      emportGroup
    };

  }),

  driverInfo: computed('provider', function() {

    const name    = get(this, 'provider');
    const choices = get(this, 'providerChoices');
    const entry   = choices.findBy('name', name);

    if ( entry ) {

      return {
        name:            entry.name,
        driverComponent: `cluster-driver/driver-${entry.driver}`,
        nodeWhich:       entry.nodeWhich,
        preSave:         !!entry.preSave,
      };

    }

  }),

  didSave() {

    const originalCluster = get(this, 'cluster');

    return originalCluster.waitForCondition('InitialRolesPopulated').then(() => {

      return this.applyHooks().then(() => {

        const clone = originalCluster.clone();

        setProperties({
          cluster: clone,
          originalCluster: originalCluster,
        });

        return clone;

      });

    });

  },

  doneSaving() {

    if ( get(this, 'step') === 1 && get(this, 'driverInfo.preSave') ) {

      setProperties(this, {
        step: 2,
        initialProvider: get(this, 'provider')
      });

    } else {

      this.sendAction('close');

    }
  },
});
