import Component from '@ember/component';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import { alias, equal } from '@ember/object/computed';
import { loadStylesheet, proxifyUrl } from 'shared/utils/load-script';
import layout from './template';
import { isEmpty } from '@ember/utils';
import $ from 'jquery';

const MEMBER_CONFIG = { type: 'clusterRoleTemplateBinding', };
const BUILD_IN_UI = ['tencentkubernetesengine', 'huaweicontainercloudengine', 'oraclecontainerengine'];

export default Component.extend(ViewNewEdit, ChildHook, {
  globalStore:               service(),
  intl:                      service(),
  access:                    service(),
  cookies:                   service(),
  router:                    service(),

  layout,
  step:                      1,
  initialProvider:           null,
  memberConfig:              MEMBER_CONFIG,
  newCluster:                false,
  needReloadSchema:          false,
  reloadingSchema:           false,
  schemaReloaded:            false,
  applyClusterTemplate:      false,
  routeLoading:              false,

  showClassicLauncher:       false,
  nodePoolErrors:            null,
  clusterTemplateRevisionId: null,

  cluster:                   alias('model.cluster'),
  originalCluster:           alias('model.originalCluster'),
  primaryResource:           alias('model.cluster'),

  isCustom:                  equal('driverInfo.nodeWhich', 'custom'),
  isK3sCluster:              equal('model.cluster.driver', 'k3s'),
  isRke2Cluster:             equal('model.cluster.driver', 'rke2'),

  init() {
    this._super(...arguments);

    // On edit pass in initialProvider, for create just set provider directly
    const initialProvider = get(this, 'initialProvider');

    if (this.cookies.get('classicClusterLaunch')) {
      set(this, 'showClassicLauncher', true);
    } else {
      set(this, 'showClassicLauncher', false);
    }

    if ( initialProvider ) {
      set(this, 'provider', initialProvider);
    }

    if ( isEmpty(get(this, 'cluster.id')) ){
      set(this, 'newCluster', true);
    }

    this.router.on('routeWillChange', (/* transition */) => {
      if ( !this.isDestroyed || !this.isDestroying ) {
        set(this, 'routeLoading', true);
      }
    });
    this.router.on('routeDidChange', (/* transition */) => {
      if ( !this.isDestroyed || !this.isDestroying ) {
        set(this, 'routeLoading', false);
      }
    });
  },

  actions: {
    updateFromYaml(newOpts) {
      let { primaryResource } = this;
      let _cachedName;

      /**
       * If a user switches to the yaml entry view before they put a name in the cluster name input
       * and then they put a name in the input rather that the yaml, when they click save we overwrite
       * the name with the empty (or remove if not included) value.
       * Ensure the name they've entered in the UI is used. This will not affect name entry in yaml.
       */
      if (primaryResource.name) {
        _cachedName = primaryResource.name;
      }

      if (this.isEdit) {
        primaryResource.merge(newOpts);
      } else {
        primaryResource.replaceWith(newOpts);
      }

      if (isEmpty(primaryResource.name) && _cachedName) {
        set(primaryResource, 'name', _cachedName);
      }
    },

    clickNext() {
      $('BUTTON[type="submit"]').click();
    },

    close(saved) {
      if (this.close) {
        this.close(saved);
      }
    },

    setNodePoolErrors(errors) {
      set(this, 'nodePoolErrors', errors);
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
        // TODO - No driver entry exists for this since it is not a kontainerEngine driver, we need to disable by default the amazon eks v1 driver
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
      ];

      out = out.filter( (o) => builtIn.findBy('id', o.kontainerId) || o.name === 'amazoneksv2' );

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
            nodePool:      true,
          });
        } else {
          set(this, 'needReloadSchema', true);
        }
      }),

      out.push({
        name:      'custom',
        driver:    'rke',
        nodeWhich: 'custom',
        nodePool:  true,
        preSave:   true
      });

      out.push({
        name:    'import',
        driver:  'import',
        preSave: true
      });

      out.push({
        name:    'importeks',
        driver:  'import-eks',
        preSave: false
      });

      out.push({
        name:    'k3s',
        driver:  'import',
        preSave: true
      });

      out.push({
        name:    'rke2',
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

  driverInfo: computed('provider', 'router.currentRoute.queryParams', function() {
    let name    = get(this, 'provider');
    const { router } = this;
    const importProvider = get(router, 'currentRoute.queryParams.importProvider');

    if (name === 'import') {
      if (isEmpty(importProvider)) {
        return null;
      } else if (importProvider === 'eks') {
        name = 'importeks'
      }
    }
    const choices = get(this, 'providerChoices');
    const entry   = choices.findBy('name', name);

    if ( entry ) {
      return {
        name:            entry.name,
        displayName:     entry.displayName,
        driverComponent: `cluster-driver/driver-${ entry.driver }`,
        nodeWhich:       entry.nodeWhich,
        preSave:         !!entry.preSave,
        nodePool:        entry.nodePool || false
      };
    }
  }),

  showDriverComponent: computed('routeLoading', 'provider', 'router.currentRoute.queryParams', function() {
    const {
      driverInfo,
      provider,
      routeLoading,
      router,
    } = this;
    const importProvider = get(router, 'currentRoute.queryParams.importProvider');

    if (routeLoading || isEmpty(driverInfo)) {
      return false;
    }


    if (provider === 'import') {
      if (!isEmpty(importProvider)) {
        return true;
      } else {
        return false;
      }
    }

    return true;
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

  doneSaving(saved) {
    if ( get(this, 'step') === 1 && get(this, 'driverInfo.preSave') ) {
      setProperties(this, {
        step:            2,
        initialProvider: get(this, 'provider')
      });
    } else {
      if (this.close) {
        this.close(saved);
      }
    }
  },

  errorSaving(/* err */) {
    if (this.applyClusterTemplate && this.primaryResource._cachedConfig) {
      let {
        localClusterAuthEndpoint,
        rancherKubernetesEngineConfig,
        enableNetworkPolicy,
        defaultClusterRoleForProjectMembers,
        defaultPodSecurityPolicyTemplateId,
      } = this.primaryResource._cachedConfig;

      setProperties(this.primaryResource, {
        localClusterAuthEndpoint,
        rancherKubernetesEngineConfig,
        enableNetworkPolicy,
        defaultClusterRoleForProjectMembers,
        defaultPodSecurityPolicyTemplateId,
      });
    }
  },
});
