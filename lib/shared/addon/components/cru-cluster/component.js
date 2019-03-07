import Component from '@ember/component';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import { alias } from '@ember/object/computed';
import { loadStylesheet, proxifyUrl } from 'shared/utils/load-script';
import layout from './template';
import { isEmpty } from '@ember/utils';

const MEMBER_CONFIG = { type: 'clusterRoleTemplateBinding', };
const BUILD_IN_UI = ['tencentkubernetesengine', 'aliyunkubernetescontainerservice', 'huaweicontainercloudengine'];

export default Component.extend(ViewNewEdit, ChildHook, {
  globalStore:      service(),
  intl:             service(),
  access:           service(),

  layout,
  step:             1,
  initialProvider:  null,
  memberConfig:     MEMBER_CONFIG,
  newCluster:       false,
  needReloadSchema: false,
  reloadingSchema:  false,
  schemaReloaded:   false,

  cluster:          alias('model.cluster'),
  originalCluster:  alias('model.originalCluster'),
  primaryResource:  alias('model.cluster'),

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

  reloadSchema: observer('needReloadSchema', function() {
    if ( !get(this, 'reloadingSchema') && get(this, 'needReloadSchema') ) {
      set(this, 'reloadingSchema', true);

      get(this, 'globalStore').findAll('schema', {
        url:         '/v3/schemas',
        forceReload: true
      }).then(() => {
        setProperties(this, {
          schemaReloaded:  true,
          reloadingSchema: false
        });
      });
    }
  }),

  kontainerDrivers: computed('model.kontainerDrivers.@each.{id,state}', function() {
    let nope     = ['import', 'rancherkubernetesengine'];
    let kDrivers = get(this, 'model.kontainerDrivers') || [];
    let builtIn  = kDrivers.filter( (d) => d.state === 'active' && (d.builtIn || BUILD_IN_UI.indexOf(d.id) > -1) && !nope.includes(d.id));
    let custom   = kDrivers.filter( (d) => d.state === 'active' && !d.builtIn && d.hasUi);

    return {
      builtIn,
      custom
    }
  }),

  providerChoices: computed(
    'isEdit',
    'cluster.rancherKubernetesEngineConfig',
    'nodeDrivers.[]',
    'schemaReloaded',
    'intl.locale',
    'kontainerDrivers.[]',
    function() {
      const { kontainerDrivers, intl  } = this;
      const { builtIn, custom } = kontainerDrivers;

      let out = [
        {
          name:        'googlegke',
          driver:      'googlegke',
          kontainerId: 'googlekubernetesengine',
        },
        {
          name:        'amazoneks',
          driver:      'amazoneks',
          kontainerId: 'amazonelasticcontainerservice',
        },
        {
          name:        'azureaks',
          driver:      'azureaks',
          kontainerId: 'azurekubernetesservice',
        },
        {
          name:        'tencenttke',
          driver:      'tencenttke',
          kontainerId: 'tencentkubernetesengine'
        },
        {
          name:        'aliyunkcs',
          driver:      'aliyunkcs',
          kontainerId: 'aliyunkubernetescontainerservice'
        },
        {
          name:        'huaweicce',
          driver:      'huaweicce',
          kontainerId: 'huaweicontainercloudengine'
        },
      ];

      out = out.filter( (o) => builtIn.findBy('id', o.kontainerId) );

      if (custom.length > 0) {
        custom.forEach( (c) => {
          const { name }           = c;
          const configName         = `${ name }EngineConfig`; // need the hyph name
          const driverEngineSchema = get(this, 'globalStore').getById('schema', configName.toLowerCase());

          if ( driverEngineSchema ) {
            out.pushObject({
              displayName: get(c, 'displayName'),
              driver:      get(c, 'name'),
              kontainerId: get(c, 'id'),
              name:        get(c, 'name'),
              genericIcon: true, // @TODO should have a way for drivers to provide an icon
            });
          } else {
            set(this, 'needReloadSchema', true);
          }
        });
      }

      get(this, 'model.nodeDrivers').filterBy('state', 'active').sortBy('name').forEach((driver) => {
        const name         = get(driver, 'name');
        const hasUi        = get(driver, 'hasUi');
        const hasIcon      = get(driver, 'hasBuiltinIconOnly');
        const uiUrl        = get(driver, 'uiUrl');
        const configName   = `${ name }Config`;
        const driverSchema = get(this, 'globalStore').getById('schema', configName.toLowerCase());

        if ( uiUrl ) {
          const cssUrl = proxifyUrl(uiUrl.replace(/\.js$/, '.css'), get(this, 'app.proxyEndpoint'));

          loadStylesheet(cssUrl, `driver-ui-css-${ name }`);
        }


        if ( driverSchema ) {
          out.push({
            name,
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
        const key = `clusterNew.${ driver.name }.label`;

        if ( !get(driver, 'displayName') && intl.exists(key) ) {
          set(driver, 'displayName', intl.t(key));
        }
      });

      if ( get(this, 'isEdit') && get(this, 'cluster.rancherKubernetesEngineConfig') ) {
        out = out.filterBy('driver', 'rke');
      }

      out.sortBy('name');

      return out;
    }),

  providerGroups: computed('providerChoices.@each.{name,driver,nodeComponent,nodeWhich,preSave}', function() {
    const choices       = get(this, 'providerChoices');
    const rkeGroup      = [];
    const cloudGroup    = [];
    const customGroup   = [];
    const importGroup   = [];

    choices.forEach((item) => {
      if (get(item, 'driver') === 'rke' && get(item, 'name') !== 'custom') {
        rkeGroup.pushObject(item);
      } else if (get(item, 'driver') === 'import' && get(item, 'name') !== 'custom') {
        importGroup.pushObject(item);
      } else if (get(item, 'name') === 'custom') {
        customGroup.pushObject(item);
      } else {
        cloudGroup.pushObject(item);
      }
    });

    return {
      cloudGroup,
      customGroup,
      importGroup,
      rkeGroup,
    };
  }),

  driverInfo: computed('provider', function() {
    const name    = get(this, 'provider');
    const choices = get(this, 'providerChoices');
    const entry   = choices.findBy('name', name);

    if ( entry ) {
      return {
        name:            entry.name,
        driverComponent: `cluster-driver/driver-${ entry.driver }`,
        nodeWhich:       entry.nodeWhich,
        preSave:         !!entry.preSave,
      };
    }
  }),

  doSave(opt) {
    opt = opt || {};
    opt.qp = { '_replace': 'true' };

    return this._super(opt);
  },

  didSave() {
    const originalCluster = get(this, 'cluster');

    return originalCluster.waitForCondition('InitialRolesPopulated').then(() => {
      return this.applyHooks().then(() => {
        const clone = originalCluster.clone();

        setProperties(this, {
          cluster:         clone,
          originalCluster,
        });

        return clone;
      });
    });
  },

  doneSaving() {
    if ( get(this, 'step') === 1 && get(this, 'driverInfo.preSave') ) {
      setProperties(this, {
        step:            2,
        initialProvider: get(this, 'provider')
      });
    } else {
      this.sendAction('close');
    }
  },
});
