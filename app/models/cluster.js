import { get, set, computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import Resource from '@rancher/ember-api-store/models/resource';
import { hasMany, reference } from '@rancher/ember-api-store/utils/denormalize';
import ResourceUsage from 'shared/mixins/resource-usage';
import Grafana from 'shared/mixins/grafana';
import { equal, alias } from '@ember/object/computed';
import { resolve } from 'rsvp';
import C from 'ui/utils/constants';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
const TRUE = 'True';
const CLUSTER_TEMPLATE_ID_PREFIX = 'cattle-global-data:';
const SCHEDULE_CLUSTER_SCAN_QUESTION_KEY = 'scheduledClusterScan.enabled';

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
  clusterScans:                hasMany('id', 'clusterScan', 'clusterId'),
  expiringCerts:               null,
  grafanaDashboardName:        'Cluster',
  isMonitoringReady:           false,
  _cachedConfig:               null,
  clusterTemplate:             reference('clusterTemplateId'),
  clusterTemplateRevision:     reference('clusterTemplateRevisionId'),
  machines:                    alias('nodes'),
  roleTemplateBindings:        alias('clusterRoleTemplateBindings'),
  isAKS:                       equal('driver', 'azureKubernetesService'),
  isGKE:                       equal('driver', 'googleKubernetesEngine'),

  runningClusterScans: computed.filterBy('clusterScans', 'isRunning', true),

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

  clusterTemplateDisplayName: computed('clusterTemplate.name', 'clusterTemplateId', function() {
    const displayName = get(this, 'clusterTemplate.displayName');
    const clusterTemplateId = (get(this, 'clusterTemplateId') || '').replace(CLUSTER_TEMPLATE_ID_PREFIX, '');

    return displayName || clusterTemplateId;
  }),

  clusterTemplateRevisionDisplayName: computed('clusterTemplateRevision.name', 'clusterTemplateRevisionId', function() {
    const displayName = get(this, 'clusterTemplateRevision.displayName');
    const revisionId = (get(this, 'clusterTemplateRevisionId') || '').replace(CLUSTER_TEMPLATE_ID_PREFIX, '')

    return displayName || revisionId;
  }),

  isClusterTemplateUpgradeAvailable: computed('clusterTemplate.latestRevision', 'clusterTemplate.latestRevision.id', 'clusterTemplateRevision.id', function() {
    const latestClusterTemplateRevisionId = get(this, 'clusterTemplate.latestRevision.id');
    const currentClusterTemplateRevisionId = get(this, 'clusterTemplateRevision.id');

    return latestClusterTemplateRevisionId
      && currentClusterTemplateRevisionId
      && currentClusterTemplateRevisionId !== latestClusterTemplateRevisionId;
  }),

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

  canRotateCerts: computed('actionLinks.rotateCertificates', function() {
    return !!this.actionLinks.rotateCertificates;
  }),

  canBulkRemove: computed('action.remove', function() { // eslint-disable-line
    return get(this, 'hasSessionToken') ? false : true;
  }),

  canSaveAsTemplate: computed('actionLinks.saveAsTemplate', 'isReady', 'clusterTemplateRevisionId', 'clusterTemplateId', function() {
    let {
      actionLinks,
      isReady,
      clusterTemplateRevisionId,
      clusterTemplateId,
    } = this;

    if (!isReady) {
      return false;
    }

    if (clusterTemplateRevisionId || clusterTemplateId) {
      return false;
    }

    return !!actionLinks.saveAsTemplate;
  }),

  configName: computed('driver', 'state', function() {
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

  displayLocation: computed('configName', function() {
    const configName = this.configName;

    if ( configName ) {
      return get(this, `${ configName }.region`) || get(this, `${ configName }.regionId`) || get(this, `${ configName }.location`) || get(this, `${ configName }.zone`) || get(this, `${ configName }.zoneId`);
    }
  }),

  clusterProvider: computed('configName', 'nodePools.@each.{driver,nodeTemplateId}', 'driver', function() {
    const pools = get(this, 'nodePools') || [];
    const firstPool = pools.objectAt(0);

    switch ( get(this, 'configName') ) {
    case 'amazonElasticContainerServiceConfig':
      return 'amazoneks';
    case 'eksConfig':
      return 'amazoneksv2';
    case 'azureKubernetesServiceConfig':
      return 'azureaks';
    case 'googleKubernetesEngineConfig':
      return 'googlegke';
    case 'tencentEngineConfig':
      return 'tencenttke';
    case 'huaweiEngineConfig':
      return 'huaweicce';
    case 'okeEngineConfig':
      return 'oracleoke';
    case 'rke2Config':
      return 'rke2';
    case 'rancherKubernetesEngineConfig':
      if ( !pools.length ) {
        return 'custom';
      }


      return firstPool.driver || get(firstPool, 'nodeTemplate.driver') || null;
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
    const configName = get(this, 'configName');

    switch ( configName ) {
    case 'amazonElasticContainerServiceConfig':
    case 'eksConfig':
      return intl.t('clusterNew.amazoneks.shortLabel');
    case 'azureKubernetesServiceConfig':
      return intl.t('clusterNew.azureaks.shortLabel');
    case 'googleKubernetesEngineConfig':
      return intl.t('clusterNew.googlegke.shortLabel');
    case 'tencentEngineConfig':
      return intl.t('clusterNew.tencenttke.shortLabel');
    case 'aliyunEngineConfig':
      return intl.t('clusterNew.aliyunack.shortLabel');
    case 'huaweiEngineConfig':
      return intl.t('clusterNew.huaweicce.shortLabel');
    case 'okeEngineConfig':
      return intl.t('clusterNew.oracleoke.shortLabel');
    case 'k3sConfig':
      return intl.t('clusterNew.k3simport.shortLabel');
    case 'rke2Config':
    case 'rancherKubernetesEngineConfig':
      var shortLabel = configName === 'rancherKubernetesEngineConfig' ? 'clusterNew.rke.shortLabel' : 'clusterNew.rke2.shortLabel';

      if ( !!pools ) {
        if ( firstPool ) {
          return get(firstPool, 'displayProvider') ? get(firstPool, 'displayProvider') : intl.t(shortLabel);
        } else {
          return intl.t(shortLabel);
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
    let projects = get(this, 'projects') || [];

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

  nodeGroupVersionUpdate: computed('appliedSpec.eksConfig.kubernetesVersion', 'appliedSpec.eksConfig.nodeGroups.@each.{version}', function() {
    if (isEmpty(get(this, 'appliedSpec.eksConfig.nodeGroups'))) {
      return false;
    }

    const kubernetesVersion = get(this, 'appliedSpec.eksConfig.kubernetesVersion');
    const nodeGroupVersions = (get(this, 'appliedSpec.eksConfig.nodeGroups') || []).getEach('version');

    return nodeGroupVersions.any((ngv) => ngv !== kubernetesVersion);
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

  availableActions: computed('actionLinks.{rotateCertificates}', 'canSaveAsTemplate', function() {
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
      {
        label:     'action.saveAsTemplate',
        icon:      'icon icon-file',
        action:    'saveAsTemplate',
        enabled:   this.canSaveAsTemplate,
      },
      {
        label:     'action.runCISScan',
        icon:      'icon icon-play',
        action:    'runCISScan',
        enabled:   !this.isClusterScanDisabled,
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

  isClusterScanDown: computed('systemProject', 'state', 'actionLinks.runSecurityScan', 'isWindows', function() {
    return !get(this, 'systemProject')
      || get(this, 'state') !== 'active'
      || !get(this, 'actionLinks.runSecurityScan')
      || get(this, 'isWindows');
  }),

  isAddClusterScanScheduleDisabled: computed('isClusterScanDown', 'scheduledClusterScan.enabled', 'clusterTemplateRevision', 'clusterTemplateRevision.questions.@each', function() {
    if (get(this, 'clusterTemplateRevision') === null) {
      return get(this, 'isClusterScanDown');
    }

    if (get(this, 'isClusterScanDown')) {
      return true;
    }

    if (get(this, 'scheduledClusterScan.enabled')) {
      return false;
    }

    return !get(this, 'clusterTemplateRevision.questions')
      || get(this, 'clusterTemplateRevision.questions').every((question) => question.variable !== SCHEDULE_CLUSTER_SCAN_QUESTION_KEY)
  }),

  isClusterScanDisabled: computed('runningClusterScans.length', 'isClusterScanDown', function() {
    return (get(this, 'runningClusterScans.length') > 0)
      || get(this, 'isClusterScanDown');
  }),

  unhealthyComponents: computed('componentStatuses.@each.conditions', function() {
    return (get(this, 'componentStatuses') || [])
      .filter((s) => !(s.conditions || []).any((c) => c.status === 'True'));
  }),

  masterNodes: computed('nodes.@each.{state,labels}', function() {
    return (this.nodes || []).filter((node) => node.labels && node.labels[C.NODES.MASTER_NODE]);
  }),

  inactiveNodes: computed('nodes.@each.state', function() {
    return (get(this, 'nodes') || []).filter( (n) => C.ACTIVEISH_STATES.indexOf(get(n, 'state')) === -1 );
  }),

  unhealthyNodes: computed('nodes.@each.conditions', function() {
    const out = [];

    (get(this, 'nodes') || []).forEach((n) => {
      const conditions = get(n, 'conditions') || [];
      const outOfDisk = conditions.find((c) => c.type === 'OutOfDisk');
      const diskPressure = conditions.find((c) => c.type === 'DiskPressure');
      const memoryPressure = conditions.find((c) => c.type === 'MemoryPressure');

      if ( outOfDisk && get(outOfDisk, 'status') === TRUE ) {
        out.push({
          displayName: get(n, 'displayName'),
          error:       'outOfDisk'
        });
      }

      if ( diskPressure && get(diskPressure, 'status') === TRUE ) {
        out.push({
          displayName: get(n, 'displayName'),
          error:       'diskPressure'
        });
      }

      if ( memoryPressure && get(memoryPressure, 'status') === TRUE ) {
        out.push({
          displayName: get(n, 'displayName'),
          error:       'memoryPressure'
        });
      }
    });

    return out;
  }),

  displayWarnings: computed('unhealthyNodes.[]', 'clusterProvider', 'inactiveNodes.[]', 'unhealthyComponents.[]', function() {
    const intl = get(this, 'intl');
    const out = [];
    const unhealthyComponents = get(this, 'unhealthyComponents') || [];
    const inactiveNodes = get(this, 'inactiveNodes') || [];
    const unhealthyNodes = get(this, 'unhealthyNodes') || [];
    const clusterProvider = get(this, 'clusterProvider');

    const grayOut = C.GRAY_OUT_SCHEDULER_STATUS_PROVIDERS.indexOf(clusterProvider) > -1;

    unhealthyComponents.forEach((component) => {
      if ( grayOut && (get(component, 'name') === 'scheduler' || get(component, 'name') === 'controller-manager') ) {
        return;
      }
      out.pushObject(intl.t('clusterDashboard.alert.component', { component: get(component, 'name') }));
    });

    inactiveNodes.forEach((node) => {
      out.pushObject(intl.t('clusterDashboard.alert.node', { node: get(node, 'displayName') }))
    });

    unhealthyNodes.forEach((node) => {
      out.pushObject(intl.t(`clusterDashboard.alert.nodeCondition.${ get(node, 'error') }`, { node: get(node, 'displayName') }))
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

    restoreFromEtcdBackup(options) {
      get(this, 'modalService').toggleModal('modal-restore-backup', {
        cluster:   this,
        selection: (options || {}).selection
      });
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

    edit(additionalQueryParams = {}) {
      let provider = get(this, 'clusterProvider') || get(this, 'driver');
      let queryParams = {
        queryParams: {
          provider,
          ...additionalQueryParams
        }
      };

      if (provider === 'amazoneks' && !isEmpty(get(this, 'eksConfig'))) {
        set(queryParams, 'queryParams.provider', 'amazoneksv2');
      }

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

    saveAsTemplate() {
      this.modalService.toggleModal('modal-save-rke-template', { cluster: this });
    },

    runCISScan(options) {
      this.get('modalService').toggleModal('run-scan-modal', {
        closeWithOutsideClick: true,
        cluster:               this,
        onRun:                 (options || {}).onRun
      });
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

  waitForClusterTemplateToBeAttached() {
    return this._waitForTestFn(() => {
      return this.hasClusterTemplate();
    }, `Wait for Cluster Template to be attached`);
  },

  hasClusterTemplate() {
    const { clusterTemplateId, clusterTemplateRevisionId } = this;

    if (isEmpty(clusterTemplateId) && isEmpty(clusterTemplateRevisionId)) {
      return false;
    }

    return true;
  },

});
