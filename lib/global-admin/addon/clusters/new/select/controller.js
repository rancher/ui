import Controller from '@ember/controller';
import {
  get,
  computed,
  set,
  observer,
  setProperties
} from '@ember/object';
import { loadStylesheet, proxifyUrl } from 'shared/utils/load-script';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import $ from 'jquery';
import { scheduleOnce } from '@ember/runloop';


export default Controller.extend({
  globalStore: service(),
  intl:        service(),
  router:      service(),
  settings:    service(),

  needReloadSchema:   false,
  reloadingSchema:    false,
  schemaReloaded:     false,
  disabledAddCluster: false,

  clusterTemplateRevisions: alias('model.clusterTemplateRevisions'),

  init() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, this.setupClickHandler);
  },

  reloadSchema: observer('needReloadSchema', function() {
    if ( !this.reloadingSchema && this.needReloadSchema ) {
      set(this, 'reloadingSchema', true);

      this.globalStore.findAll('schema', {
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
    const build_in_ui = ['tencentkubernetesengine', 'huaweicontainercloudengine', 'oraclecontainerengine', 'linodekubernetesengine', 'ociocneengine'];
    const nope       = ['import', 'rancherkubernetesengine'];
    const kDrivers   = get(this, 'model.kontainerDrivers') || [];
    const builtIn    = kDrivers.filter( (d) => d.state === 'active' && (d.builtIn || build_in_ui.indexOf(d.id) > -1) && !nope.includes(d.id));
    const custom     = kDrivers.filter( (d) => d.state === 'active' && !d.builtIn && d.hasUi);

    return {
      builtIn,
      custom
    }
  }),

  providerChoices: computed('app.proxyEndpoint', 'intl.locale', 'kontainerDrivers.[]', 'model.nodeDrivers.{id,state}', 'schemaReloaded', function() {
    const { kontainerDrivers, intl  } = this;
    const { builtIn, custom } = kontainerDrivers;

    let out = [
      {
        name:        'googlegke',
        driver:      'googlegke',
        kontainerId: 'googlekubernetesengine',
      },
      {
        displayName: 'Google GKE',
        driver:      'gke',
        name:        'googlegkev2',
        nodePool:    false,
        nodeWhich:   'gke',
        preSave:     false,
        postSave:    true,
      },
      {
        name:        'amazoneks',
        driver:      'amazoneks',
        kontainerId: 'amazonelasticcontainerservice',
      },
      // No driver entry exists for this since it is not a kontainerEngine driver
      {
        displayName: 'Amazon EKS',
        driver:      'eks',
        name:        'amazoneksv2',
        nodePool:    false,
        nodeWhich:   'eks',
        preSave:     false,
      },
      {
        name:        'azureaks',
        driver:      'azureaks',
        kontainerId: 'azurekubernetesservice',
      },
      {
        displayName: 'Azure AKS',
        driver:      'aks',
        name:        'azureaksv2',
        nodePool:    false,
        nodeWhich:   'aks',
        preSave:     false,
        postSave:    true,
      },
      {
        name:        'tencenttke',
        driver:      'tencenttke',
        kontainerId: 'tencentkubernetesengine'
      },
      {
        name:        'huaweicce',
        driver:      'huaweicce',
        kontainerId: 'huaweicontainercloudengine'
      },
      {
        name:        'oracleoke',
        driver:      'oracleoke',
        kontainerId: 'oraclecontainerengine'
      },
      {
        name:        'ociocne',
        driver:      'ociocne',
        kontainerId: 'ociocneengine'
      },
      {
        name:        'linodelke',
        driver:      'linodelke',
        kontainerId: 'linodekubernetesengine'
      },
    ];

    out = out.filter( (o) => builtIn.findBy('id', o.kontainerId) || o.name === 'amazoneksv2' || o.name === 'googlegkev2' || o.name === 'azureaksv2');

    if (custom.length > 0) {
      custom.forEach( (c) => {
        const { name }           = c;
        const configName         = `${ name }EngineConfig`;
        const driverEngineSchema = this.globalStore.getById('schema', configName.toLowerCase());

        if ( driverEngineSchema ) {
          let {
            displayName, name: driver, id: kontainerId, name, genericIcon = true
          } = c;

          out.pushObject({
            displayName,
            driver,
            kontainerId,
            name,
            genericIcon
          });
        } else {
          set(this, 'needReloadSchema', true);
        }
      });
    }

    get(this, 'model.nodeDrivers').filterBy('state', 'active').sortBy('name').forEach((driver) => {
      const {
        name, hasUi, hasBuiltinIconOnly: hasIcon, uiUrl
      }                  = driver;
      const configName   = `${ name }Config`;
      const driverSchema = this.globalStore.getById('schema', configName.toLowerCase());

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
      cloudGroup:  cloudGroup.sortBy('name'),
      customGroup: customGroup.sortBy('name'),
      importGroup: importGroup.sortBy('name'),
      rkeGroup:    rkeGroup.sortBy('name'),
    };
  }),

  setupClickHandler() {
    $('BODY').on('click', '#k3s-info-external-link', (e) => {
      e.stopPropigation();
    });
  },
});
