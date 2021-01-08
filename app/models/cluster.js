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
import { isEmpty, isEqual } from '@ember/utils';
import moment from 'moment';
import jsondiffpatch from 'jsondiffpatch';
import { isArray } from '@ember/array';
import Semver from 'semver';

const TRUE = 'True';
const CLUSTER_TEMPLATE_ID_PREFIX = 'cattle-global-data:';
const SCHEDULE_CLUSTER_SCAN_QUESTION_KEY = 'scheduledClusterScan.enabled';

export const DEFAULT_NODE_GROUP_CONFIG = {
  desiredSize:   2,
  diskSize:      20,
  ec2SshKey:     '',
  gpu:           false,
  instanceType:  't3.medium',
  maxSize:       2,
  minSize:       2,
  nodegroupName: '',
  subnets:       [],
  type:          'nodeGroup',
};

export const DEFAULT_EKS_CONFIG = {
  amazonCredentialSecret: '',
  displayName:            '',
  imported:               false,
  kmsKey:                 '',
  kubernetesVersion:      '',
  loggingTypes:           [],
  nodeGroups:             [],
  privateAccess:          false,
  publicAccess:           true,
  publicAccessSources:    [],
  region:                 'us-west-2',
  secretsEncryption:      false,
  securityGroups:         [],
  serviceRole:            '',
  subnets:                [],
  tags:                   {},
  type:                   'eksclusterconfigspec',
};


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

  clusterTemplateDisplayName: computed('clusterTemplate.{displayName,name}', 'clusterTemplateId', function() {
    const displayName = get(this, 'clusterTemplate.displayName');
    const clusterTemplateId = (get(this, 'clusterTemplateId') || '').replace(CLUSTER_TEMPLATE_ID_PREFIX, '');

    return displayName || clusterTemplateId;
  }),

  clusterTemplateRevisionDisplayName: computed('clusterTemplateRevision.{displayName,name}', 'clusterTemplateRevisionId', function() {
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

  canRotateEncryptionKey: computed(
    'actionLinks.rotateEncryptionKey',
    'etcdbackups.@each.created',
    'rancherKubernetesEngineConfig.rotateEncryptionKey',
    'rancherKubernetesEngineConfig.services.kubeApi.secretsEncryptionConfig.enabled',
    'transitioning',
    'isActive',
    function() {
      const acceptableTimeFrame = 360;
      const {
        actionLinks: { rotateEncryptionKey }, etcdbackups, rancherKubernetesEngineConfig
      } = this;
      const lastBackup = !isEmpty(etcdbackups) ? get(etcdbackups, 'lastObject') : undefined;
      let diffInMinutes = 0;

      if (this.transitioning !== 'no' || !this.isActive) {
        return false;
      }

      if (isEmpty(rancherKubernetesEngineConfig)) {
        return false;
      } else {
        const {
          rotateEncryptionKey = false,
          services: { kubeApi: { secretsEncryptionConfig = null } }
        } = rancherKubernetesEngineConfig;

        if (!!rotateEncryptionKey || isEmpty(secretsEncryptionConfig) || !get(secretsEncryptionConfig, 'enabled')) {
          return false
        }
      }

      if (lastBackup) {
        diffInMinutes = moment().diff(lastBackup.created, 'minutes');
      }

      return rotateEncryptionKey && diffInMinutes <= acceptableTimeFrame;
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

  eksDisplayEksImport: computed('clusterProvider', 'eksConfig.privateAccess', 'eksStatus.upstreamSpec.privateAccess', function() {
    const {
      clusterProvider, eksConfig = {}, eksStatus = {}
    } = this;
    const publicAccess = get(eksStatus, 'upstreamSpec.publicAccess') || get(eksConfig, 'publicAccess') || true;
    const privateAccess = get(eksStatus, 'upstreamSpec.privateAccess') || get(eksConfig, 'privateAccess') || false;

    if (clusterProvider === 'amazoneksv2' && !publicAccess && privateAccess) {
      return true;
    }

    return false;
  }),

  canShowAddHost: computed('nodes.[]', 'clusterProvider', 'eksConfig.privateAccess', 'eksStatus.upstreamSpec.privateAccess', function() {
    const {
      clusterProvider, eksConfig = {}, eksStatus = {}
    } = this;
    const publicAccess = get(eksStatus, 'upstreamSpec.publicAccess') || get(eksConfig, 'publicAccess') || true;
    const privateAccess = get(eksStatus, 'upstreamSpec.privateAccess') || get(eksConfig, 'privateAccess') || false;
    const ignored = ['custom', 'import', 'amazoneksv2'];
    const nodes = get(this, 'nodes');

    if (!ignored.includes(clusterProvider)) {
      return false;
    }

    // private access requires the ability to run the import command on the cluster
    if (clusterProvider === 'amazoneksv2' && !!publicAccess && privateAccess) {
      return true;
    } else if (clusterProvider !== 'amazoneksv2' && isEmpty(nodes)) {
      return true;
    }

    return false;
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

    return '';
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
    case 'lkeEngineConfig':
      return 'linodelke';
    case 'rke2Config':
      return 'rke2';
    case 'rancherKubernetesEngineConfig':
      if ( !pools.length ) {
        return 'custom';
      }

      return firstPool.driver || get(firstPool, 'nodeTemplate.driver') || null;
    default:
      if (get(this, 'driver')) {
        return get(this, 'driver');
      } else {
        return 'import';
      }
    }
  }),

  displayProvider: computed('configName', 'driver', 'intl.locale', 'nodePools.@each.displayProvider', 'provider', function() {
    const intl = get(this, 'intl');
    const pools = get(this, 'nodePools');
    const firstPool = (pools || []).objectAt(0);
    const configName = get(this, 'configName');
    const driverName = get(this, 'driver');

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
    case 'otccceEngineConfig':
      return intl.t('clusterNew.otccce.shortLabel');
    case 'lkeEngineConfig':
      return intl.t('clusterNew.linodelke.shortLabel');
    case 'k3sConfig':
      return intl.t('clusterNew.k3simport.shortLabel');
    case 'rke2Config':
    case 'rancherKubernetesEngineConfig':
      var shortLabel;

      if (configName === 'rancherKubernetesEngineConfig') {
        if (this.provider === 'rke.windows') {
          shortLabel = 'clusterNew.rkeWindows.shortLabel'
        } else {
          shortLabel = 'clusterNew.rke.shortLabel'
        }
      } else {
        shortLabel = 'clusterNew.rke2.shortLabel';
      }

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
      if (driverName) {
        switch (driverName) {
        case 'rancherd':
          return intl.t('clusterNew.rancherd.shortLabel');
        default:
          return driverName.capitalize();
        }
      } else {
        return intl.t('clusterNew.import.shortLabel');
      }
    }
  }),

  systemProject: computed('projects.@each.isSystemProject', function() {
    let projects = (get(this, 'projects') || []).filterBy('isSystemProject', true);

    return get(projects, 'firstObject');
  }),

  canSaveMonitor: computed('actionLinks.{editMonitoring,enableMonitoring}', 'enableClusterMonitoring', function() {
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

  nodeGroupVersionUpdate: computed('eksStatus.upstreamSpec.kubernetesVersion', 'eksStatus.upstreamSpec.nodeGroups.@each.version', function() {
    if (isEmpty(get(this, 'eksStatus.upstreamSpec.nodeGroups'))) {
      return false;
    }

    const kubernetesVersion = get(this, 'eksStatus.upstreamSpec.kubernetesVersion');
    const nodeGroupVersions = (get(this, 'eksStatus.upstreamSpec.nodeGroups') || []).getEach('version');

    return nodeGroupVersions.any((ngv) => Semver.lt(Semver.coerce(ngv), Semver.coerce(kubernetesVersion)));
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

  availableActions: computed('actionLinks.{rotateCertificates,rotateEncryptionKey}', 'canRotateEncryptionKey', 'canSaveAsTemplate', 'canShowAddHost', 'eksDisplayEksImport', 'isClusterScanDisabled', function() {
    const a = get(this, 'actionLinks') || {};

    return [
      {
        label:     'action.rotate',
        icon:      'icon icon-history',
        action:    'rotateCertificates',
        enabled:   !!a.rotateCertificates,
      },
      {
        label:     'action.rotateEncryption',
        icon:      'icon icon-key',
        action:    'rotateEncryptionKey',
        enabled:   !!this.canRotateEncryptionKey,
        // enabled: true
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
        label:     this.eksDisplayEksImport ? 'action.importHost' : 'action.addHost',
        icon:      'icon icon-host',
        action:    'showCommandModal',
        enabled:   this.canShowAddHost,
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

  isAddClusterScanScheduleDisabled: computed('isClusterScanDown', 'scheduledClusterScan.enabled', 'clusterTemplateRevision', 'clusterTemplateRevision.questions.[]', function() {
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

    rotateEncryptionKey() {
      const model = this;

      get(this, 'modalService').toggleModal('modal-rotate-encryption-key', { model, });
    },

    showCommandModal() {
      this.modalService.toggleModal('modal-show-command', { cluster: this });
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

  save(opt) {
    const { globalStore, eksConfig } = this;

    if (get(this, 'driver') === 'EKS' || (this.isObject(get(this, 'eksConfig')) && !this.isEmptyObject(get(this, 'eksConfig')))) {
      const options = ({
        ...opt,
        data: {
          name:      this.name,
          eksConfig: {},
        }
      });
      const eksClusterConfigSpec = globalStore.getById('schema', 'eksclusterconfigspec');
      const nodeGroupConfigSpec = globalStore.getById('schema', 'nodegroup');

      if (isEmpty(this.id)) {
        sanitizeConfigs(eksClusterConfigSpec, nodeGroupConfigSpec);

        if (!get(this, 'eksConfig.imported') && this.name !== get(this, 'eksConfig.displayName')) {
          set(this, 'eksConfig.displayName', this.name);
        }

        return this._super(...arguments);
      } else {
        const config = jsondiffpatch.clone(get(this, 'eksConfig'));
        const upstreamSpec = jsondiffpatch.clone(get(this, 'eksStatus.upstreamSpec'));

        if (isEmpty(upstreamSpec)) {
          sanitizeConfigs(eksClusterConfigSpec, nodeGroupConfigSpec);

          return this._super(...arguments);
        }

        set(options, 'data.eksConfig', this.diffEksUpstream(upstreamSpec, config));

        if (!isEmpty(get(options, 'data.eksConfig.nodeGroups'))) {
          get(options, 'data.eksConfig.nodeGroups').forEach((ng) => {
            replaceNullWithEmptyDefaults(ng, get(nodeGroupConfigSpec, 'resourceFields'));
          });
        }

        if (get(options, 'qp._replace')) {
          delete options.qp['_replace'];
        }

        return this._super(options);
      }
    } else {
      return this._super(...arguments);
    }

    function sanitizeConfigs(eksClusterConfigSpec, nodeGroupConfigSpec) {
      replaceNullWithEmptyDefaults(eksConfig, get(eksClusterConfigSpec, 'resourceFields'));

      if (!isEmpty(get(eksConfig, 'nodeGroups'))) {
        get(eksConfig, 'nodeGroups').forEach((ng) => {
          replaceNullWithEmptyDefaults(ng, get(nodeGroupConfigSpec, 'resourceFields'));
        });
      }
    }

    function replaceNullWithEmptyDefaults(config, resourceFields) {
      Object.keys(config).forEach((ck) => {
        const configValue = get(config, ck);

        if (configValue === null || typeof configValue === 'undefined') {
          const resourceField = resourceFields[ck];

          if (resourceField.type === 'string') {
            set(config, ck, '');
          } else if (resourceField.type.includes('array')) {
            set(config, ck, []);
          } else if (resourceField.type.includes('map')) {
            set(config, ck, {});
          } else if (resourceField.type.includes('boolean')) {
            if (resourceField.default) {
              set(config, ck, resourceField.default);
            } else {
              if ( !isEmpty(get(DEFAULT_EKS_CONFIG, ck)) || !isEmpty(get(DEFAULT_NODE_GROUP_CONFIG, ck)) ) {
                let match = isEmpty(get(DEFAULT_EKS_CONFIG, ck)) ? get(DEFAULT_NODE_GROUP_CONFIG, ck) : get(DEFAULT_EKS_CONFIG, ck);

                set(config, ck, match);
              }
              // we shouldn't get here, there are not that many fields in EKS and I've set the defaults for bools that are there
              // but if we do hit this branch my some magic case imo a bool isn't something we can default cause its unknown...just dont do anything.
            }
          }
        }
      });

      return config;
    }
  },

  diffEksUpstream(lhs, rhs) {
    // this is NOT a generic object diff.
    // It tries to be as generic as possible but it does make certain assumptions regarding nulls and emtpy arrays/objects
    // if LHS (upstream) is null and RHS (eks config) is empty we do not count this as a change
    // additionally null values on the RHS will be ignored as null cant be sent in this case
    const delta = {};
    const rhsKeys = Object.keys(rhs);

    rhsKeys.forEach((k) => {
      if (k === 'type') {
        return;
      }

      const lhsMatch = get(lhs, k);
      const rhsMatch = get(rhs, k);

      try {
        if (isEqual(JSON.stringify(lhsMatch), JSON.stringify(rhsMatch))) {
          return;
        }
      } catch (e){}

      if (k === 'nodeGroups' || k === 'tags') {
        if (!isEmpty(rhsMatch)) {
          // node groups need ALL data so short circut and send it all
          set(delta, k, rhsMatch);
        } else {
          // all node groups were deleted
          set(delta, k, []);
        }

        return;
      }

      if (isEmpty(lhsMatch) || this.isEmptyObject(lhsMatch)) {
        if (isEmpty(rhsMatch) || this.isEmptyObject(rhsMatch)) {
          if (lhsMatch !== null && (isArray(rhsMatch) || this.isObject(rhsMatch))) {
            // Empty Arrays and Empty Maps must be sent as such unless the upstream value is null, then the empty array or obj is just a init value from ember
            set(delta, k, rhsMatch);
          }

          return;
        } else {
          // lhs is empty, rhs is not, just set
          set(delta, k, rhsMatch);
        }
      } else {
        if (rhsMatch !== null) {
          // entry in og obj
          if (isArray(lhsMatch)) {
            if (isArray(rhsMatch)) {
              if (!isEmpty(rhsMatch) && rhsMatch.every((m) => this.isObject(m))) {
                // You have more diffing to do
                rhsMatch.forEach((match) => {
                  // our most likely candiate for a match is node group name, but lets check the others just incase.
                  const matchId = get(match, 'name') || get(match, 'id') || false;

                  if (matchId) {
                    let lmatchIdx;

                    // we have soime kind of identifier to find a match in the upstream, so we can diff and insert to new array
                    const lMatch = lhsMatch.find((l, idx) => {
                      const lmatchId = get(l, 'name') || get(l, 'id');

                      if (lmatchId === matchId) {
                        lmatchIdx = idx;

                        return l;
                      }
                    });

                    if (lMatch) {
                      // we have a match in the upstream, meaning we've probably made updates to the object itself
                      const diffedMatch = this.diffEksUpstream(lMatch, match);

                      if (!isArray(get(delta, k))) {
                        set(delta, k, [diffedMatch]);
                      } else {
                        // diff and push into new array
                        delta[k].insertAt(lmatchIdx, diffedMatch);
                      }
                    } else {
                      // no match in upstream, new entry
                      if (!isArray(get(delta, k))) {
                        set(delta, k, [match]);
                      } else {
                        delta[k].pushObject(match);
                      }
                    }
                  } else {
                    // no match id, all we can do is dumb add
                    if (!isArray(get(delta, k))) {
                      set(delta, k, [match]);
                    } else {
                      delta[k].pushObject(match);
                    }
                  }
                })
              } else {
                set(delta, k, rhsMatch);
              }
            } else {
              set(delta, k, rhsMatch);
            }
          } else if (this.isObject(lhsMatch)) {
            if (!isEmpty(rhsMatch) && !this.isEmptyObject(rhsMatch)) {
              if ((Object.keys(lhsMatch) || []).length > 0) {
                // You have more diffing to do
                set(delta, k, this.diffEksUpstream(lhsMatch, rhsMatch));
              } else if (this.isEmptyObject(lhsMatch)) {
                // we had a map now we have an empty map
                set(delta, k, {});
              }
            }
          } else { // lhsMatch not an array or object
            set(delta, k, rhsMatch);
          }
        }
      }
    });

    return delta;
  },

  /**
   * True if obj is a plain object, an instantiated function/class
   * @param {anything} obj
   */
  isObject(obj) {
    return obj                   // Eliminates null/undefined
      && obj instanceof Object   // Eliminates primitives
      && typeof obj === 'object' // Eliminates class definitions/functions
      && !Array.isArray(obj);    // Eliminates arrays
  },

  isEmptyObject(obj) {
    return this.isObject(obj) && Object.keys(obj).length === 0;
  }

});
