import { get, set, computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import Resource from '@rancher/ember-api-store/models/resource';
import { hasMany } from '@rancher/ember-api-store/utils/denormalize';
import ResourceUsage from 'shared/mixins/resource-usage';
import Grafana from 'shared/mixins/grafana';
import { equal, alias } from '@ember/object/computed';
import { resolve } from 'rsvp';
import C from 'ui/utils/constants';
import { isEmpty } from '@ember/utils';
import moment from 'moment';

export default Resource.extend(Grafana, ResourceUsage, {
  globalStore: service(),
  growl:       service(),
  intl:        service(),
  router:      service(),
  scope:       service(),

  clusterRoleTemplateBindings: hasMany('id', 'clusterRoleTemplateBinding', 'clusterId'),
  etcdbackups:                 hasMany('id', 'etcdbackup', 'clusterId'),
  namespaces:                  hasMany('id', 'namespace', 'clusterId'),
  nodePools:                   hasMany('id', 'nodePool', 'clusterId'),
  nodes:                       hasMany('id', 'node', 'clusterId'),
  projects:                    hasMany('id', 'project', 'clusterId'),
  expiringCerts:               null,
  grafanaDashboardName:        'Cluster',
  isMonitoringReady:           false,
  _cachedConfig:               null,
  machines:                    alias('nodes'),
  roleTemplateBindings:        alias('clusterRoleTemplateBindings'),
  isAKS:                       equal('driver', 'azureKubernetesService'),
  isGKE:                       equal('driver', 'googleKubernetesEngine'),

  conditionsDidChange:        on('init', observer('enableClusterMonitoring', 'conditions.@each.status', function() {
    if ( !get(this, 'enableClusterMonitoring') ) {
      return false;
    }
    const conditions = get(this, 'conditions') || [];

    const ready = conditions.findBy('type', 'MonitoringEnabled');

    const status = ready && get(ready, 'status') === 'True';

    if ( status !== get(this, 'isMonitoringReady') ) {
      set(this, 'isMonitoringReady', status);
    }
  })),

  getAltActionDelete: computed('action.remove', function() { // eslint-disable-line
    return get(this, 'canBulkRemove') ? 'delete' : null;
  }),

  hasSessionToken: computed('annotations', function() {
    const sessionTokenLabel = `${ (get(this, 'annotations') || {})[C.LABEL.EKS_SESSION_TOKEN]  }`;
    let hasSessionToken      = false;

    if (sessionTokenLabel === 'undefined' || sessionTokenLabel === 'false') {
      hasSessionToken = false;
    } else {
      hasSessionToken = true;
    }

    return hasSessionToken;
  }),

  canBulkRemove: computed('action.remove', function() { // eslint-disable-line
    return get(this, 'hasSessionToken') ? false : true;
  }),

  configName: computed(function() {
    const keys = this.allKeys().filter((x) => x.endsWith('Config'));

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( get(this, key) ) {
        return key;
      }
    }

    return null;
  }),

  isReady: computed('conditions.@each.status', function() {
    return this.hasCondition('Ready');
  }),

  isRKE: computed('configName', function() {
    return get(this, 'configName') === 'rancherKubernetesEngineConfig';
  }),

  provider: computed('configName', 'nodePools.@each.nodeTemplateId', 'driver', function() {
    const pools = get(this, 'nodePools') || [];
    const firstTemplate = get(pools, 'firstObject.nodeTemplate');

    switch ( get(this, 'configName') ) {
    case 'amazonElasticContainerServiceConfig':
      return 'amazoneks';
    case 'azureKubernetesServiceConfig':
      return 'azureaks';
    case 'googleKubernetesEngineConfig':
      return 'googlegke';
    case 'tencentEngineConfig':
      return 'tencenttke';
    case 'aliyunEngineConfig':
      return 'aliyunkcs';
    case 'huaweiEngineConfig':
      return 'huaweicce';
    case 'rancherKubernetesEngineConfig':
      if ( pools.length > 0 ) {
        if ( firstTemplate ) {
          return get(firstTemplate, 'driver');
        } else {
          return null;
        }
      } else {
        return 'custom';
      }
    default:
      if (get(this, 'driver') && get(this, 'configName')) {
        return get(this, 'driver');
      } else {
        return 'import';
      }
    }
  }),

  displayProvider: computed('configName', 'nodePools.@each.displayProvider', 'intl.locale', 'driver', function() {
    const intl = get(this, 'intl');
    const pools = get(this, 'nodePools');
    const firstPool = (pools || []).objectAt(0);

    switch ( get(this, 'configName') ) {
    case 'amazonElasticContainerServiceConfig':
      return intl.t('clusterNew.amazoneks.shortLabel');
    case 'azureKubernetesServiceConfig':
      return intl.t('clusterNew.azureaks.shortLabel');
    case 'googleKubernetesEngineConfig':
      return intl.t('clusterNew.googlegke.shortLabel');
    case 'tencentEngineConfig':
      return intl.t('clusterNew.tencenttke.shortLabel');
    case 'aliyunEngineConfig':
      return intl.t('clusterNew.aliyunkcs.shortLabel');
    case 'huaweiEngineConfig':
      return intl.t('clusterNew.huaweicce.shortLabel');
    case 'rancherKubernetesEngineConfig':
      if ( !!pools ) {
        if ( firstPool ) {
          return get(firstPool, 'displayProvider') ? get(firstPool, 'displayProvider') : intl.t('clusterNew.rke.shortLabel');
        } else {
          return intl.t('clusterNew.rke.shortLabel');
        }
      } else {
        return intl.t('clusterNew.custom.shortLabel');
      }
    default:
      if (get(this, 'driver') && get(this, 'configName')) {
        return get(this, 'driver').capitalize();
      } else {
        return intl.t('clusterNew.import.shortLabel');
      }
    }
  }),

  systemProject: computed('projects.@each.isSystemProject', function() {
    let projects = (get(this, 'projects') || []).filterBy('isSystemProject', true);

    return get(projects, 'firstObject');
  }),

  canSaveMonitor: computed('actionLinks.{editMonitoring,enableMonitoring}', function() {
    const action = get(this, 'enableClusterMonitoring') ?  'editMonitoring' : 'enableMonitoring';

    return !!this.hasAction(action)
  }),

  canDisableMonitor: computed('actionLinks.disableMonitoring', function() {
    return !!this.hasAction('disableMonitoring')
  }),

  defaultProject: computed('projects.@each.{name,clusterOwner}', function() {
    let projects = get(this, 'projects');

    let out = projects.findBy('isDefault');

    if ( out ) {
      return out;
    }

    out = projects.findBy('clusterOwner', true);
    if ( out ) {
      return out;
    }

    out = projects.objectAt(0);

    return out;
  }),

  certsExpiring: computed('certificatesExpiration', function() {
    let { certificatesExpiration = {}, expiringCerts } = this;

    if (!expiringCerts) {
      expiringCerts = [];
    }

    if (!isEmpty(certificatesExpiration)) {
      let expKeys = Object.keys(certificatesExpiration);

      expKeys.forEach((kee) => {
        let certDate  = get(certificatesExpiration[kee], 'expirationDate');
        const expirey = moment(certDate);
        let diff      = expirey.diff(moment());

        if (diff < 2592000000) { // milliseconds in a month
          expiringCerts.pushObject({
            expiringCertName: kee,
            milliUntil:       diff,
            exactDateTime:    certDate
          });
        }
      });

      set(this, 'expiringCerts', expiringCerts);

      return expiringCerts.length > 0;
    }

    return false;
  }),

  availableActions: computed('actionLinks.{rotateCertificates}', function() {
    const a = get(this, 'actionLinks') || {};

    return [
      {
        label:     'action.rotate',
        icon:      'icon icon-history',
        action:    'rotateCertificates',
        enabled:   !!a.rotateCertificates,
      },
      {
        label:     'action.backupEtcd',
        icon:      'icon icon-history',
        action:    'backupEtcd',
        enabled:   !!a.backupEtcd,
      },
      {
        label:     'action.restoreFromEtcdBackup',
        icon:      'icon icon-history',
        action:    'restoreFromEtcdBackup',
        enabled:   !!a.restoreFromEtcdBackup,
      },
    ];
  }),

  isVxlan: computed('rancherKubernetesEngineConfig.network.options.flannel_backend_type', function() {
    const backend = get(this, 'rancherKubernetesEngineConfig.network.options.flannel_backend_type');

    return backend === 'vxlan';
  }),

  isWindows:  computed('windowsPreferedCluster', function() {
    return !!get(this, 'windowsPreferedCluster');
  }),

  unhealthyComponents: computed('componentStatuses.@each.conditions', function() {
    return (get(this, 'componentStatuses') || [])
      .filter((s) => !s.conditions.any((c) => c.status === 'True'));
  }),

  inactiveNodes: computed('nodes.@each.state', function() {
    return get(this, 'nodes').filter( (n) => C.ACTIVEISH_STATES.indexOf(get(n, 'state')) === -1 );
  }),

  displayWarnings: computed('provider', 'inactiveNodes.[]', 'unhealthyComponents.[]', function() {
    const intl = get(this, 'intl');
    const out = [];
    const unhealthyComponents = get(this, 'unhealthyComponents') || [];
    const inactiveNodes = get(this, 'inactiveNodes') || [];
    const provider = get(this, 'provider');

    const grayOut = C.GRAY_OUT_SCHEDULER_STATUS_PROVIDERS.indexOf(provider) > -1;

    unhealthyComponents.forEach((component) => {
      if ( grayOut && (get(component, 'name') === 'scheduler' || get(component, 'name') === 'controller-manager') ) {
        return;
      }
      out.pushObject(intl.t('clusterDashboard.alert.component', { component: get(component, 'name') }));
    });

    inactiveNodes.forEach((node) => {
      out.pushObject(intl.t('clusterDashboard.alert.node', { node: get(node, 'displayName') }))
    });

    return out;
  }),

  actions: {
    backupEtcd() {
      const getBackupType = () => {
        let services = get(this, 'rancherKubernetesEngineConfig.services.etcd');

        if (get(services, 'cachedConfig')) {
          if (isEmpty(services.cachedConfig.s3BackupConfig)) {
            return 'local';
          } else if (!isEmpty(services.cachedConfig.s3BackupConfig)) {
            return 's3';
          }
        }
      }

      const backupType     = getBackupType();
      const successTitle   = this.intl.t('action.backupEtcdMessage.success.title');
      const successMessage = this.intl.t('action.backupEtcdMessage.success.message', {
        clusterId: this.displayName || this.id,
        backupType
      });

      this.doAction('backupEtcd')
        .then(() => this.growl.success(successTitle, successMessage))
        .catch((err) => this.growl.fromError(err));
    },

    restoreFromEtcdBackup() {
      get(this, 'modalService').toggleModal('modal-restore-backup', { cluster: this, });
    },

    promptDelete() {
      const hasSessionToken = get(this, 'canBulkRemove') ? false : true; // canBulkRemove returns true of the session token is set false

      if (hasSessionToken) {
        set(this, `${ get(this, 'configName') }.accessKey`, null);
        get(this, 'modalService').toggleModal('modal-delete-eks-cluster', { model: this, });
      } else {
        get(this, 'modalService').toggleModal('confirm-delete', {
          escToClose: true,
          resources:  [this]
        });
      }
    },

    edit() {
      let provider = get(this, 'provider') || get(this, 'driver');
      let queryParams = { queryParams: { provider } };

      if (this.clusterTemplateRevisionId) {
        set(queryParams, 'queryParams.clusterTemplateRevision', this.clusterTemplateRevisionId);
      }

      this.router.transitionTo('authenticated.cluster.edit', get(this, 'id'), queryParams);
    },

    scaleDownPool(id) {
      const pool = (get(this, 'nodePools') || []).findBy('id', id);

      if ( pool ) {
        pool.incrementQuantity(-1);
      }
    },

    scaleUpPool(id) {
      const pool = (get(this, 'nodePools') || []).findBy('id', id);

      if ( pool ) {
        pool.incrementQuantity(1);
      }
    },

    rotateCertificates() {
      const model = this;

      get(this, 'modalService').toggleModal('modal-rotate-certificates', {
        model,
        serviceDefaults: get(this, 'globalStore').getById('schema', 'rotatecertificateinput').optionsFor('services'),
      });
    },

  },

  clearConfigFieldsForClusterTemplate() {
    let clearedNull   = ['localClusterAuthEndpoint', 'rancherKubernetesEngineConfig', 'enableNetworkPolicy'];
    let clearedDelete = ['defaultClusterRoleForProjectMembers', 'defaultPodSecurityPolicyTemplateId'];
    let {
      localClusterAuthEndpoint,
      rancherKubernetesEngineConfig,
      enableNetworkPolicy,
      defaultClusterRoleForProjectMembers,
      defaultPodSecurityPolicyTemplateId,
    } = this;

    let cachedConfig = {
      localClusterAuthEndpoint,
      rancherKubernetesEngineConfig,
      enableNetworkPolicy,
      defaultClusterRoleForProjectMembers,
      defaultPodSecurityPolicyTemplateId,
    };

    // set this incase we fail to save the cluster;
    set(this, '_cachedConfig', cachedConfig);

    clearedDelete.forEach((c) => delete this[c]);
    clearedNull.forEach((c) => set(this, c, null));
  },

  clearProvidersExcept(keep) {
    const keys = this.allKeys().filter((x) => x.endsWith('Config'));

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( key !== keep && get(this, key) ) {
        set(this, key, null);
      }
    }
  },

  delete(/* arguments*/) {
    const promise = this._super.apply(this, arguments);

    return promise.then((/* resp */) => {
      if (get(this, 'scope.currentCluster.id') === get(this, 'id')) {
        get(this, 'router').transitionTo('global-admin.clusters');
      }
    });
  },

  getOrCreateToken() {
    const globalStore = get(this, 'globalStore');
    const id = get(this, 'id');

    return globalStore.findAll('clusterRegistrationToken', { forceReload: true }).then((tokens) => {
      let token = tokens.filterBy('clusterId', id)[0];

      if ( token ) {
        return resolve(token);
      } else {
        token = get(this, 'globalStore').createRecord({
          type:      'clusterRegistrationToken',
          clusterId: id
        });

        return token.save();
      }
    });
  },
});
