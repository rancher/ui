import Component from '@ember/component';
import layout from './template';

const userInfo = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.enabled',
    value: 'userinfo.email',
  }
]

const computeEngine = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.readOnly',
    value: 'compute.readonly',
  },
  {
    label: 'generic.readWrite',
    value: 'compute',
  },
]

const storage = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.readOnly',
    value: 'devstorage.read_only',
  },
  {
    label: 'generic.writeOnly',
    value: 'devstorage.write_only',
  },
  {
    label: 'generic.readWrite',
    value: 'devstorage',
  },
  {
    label: 'generic.full',
    value: 'devstorage.full_control',
  },
]

const taskQueue = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.enabled',
    value: 'taskqueue',
  }
]

const bigQuery = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.enabled',
    value: 'bigquery',
  }
]

const cloudSQL = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.enabled',
    value: 'sqlservice.admin',
  }
]

const cloudDatastore = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.enabled',
    value: 'clouddatastore',
  }
]

const stackdriverLoggingAPI = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.writeOnly',
    value: 'logging.write',
  },
  {
    label: 'generic.readOnly',
    value: 'logging.read',
  },
  {
    label: 'generic.full',
    value: 'logging.admin',
  },
]

const stackdriverMonitoringAPI = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.writeOnly',
    value: 'monitoring.write',
  },
  {
    label: 'generic.readOnly',
    value: 'monitoring.read',
  },
  {
    label: 'generic.full',
    value: 'monitoring',
  },
]

const cloudPlatform = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.enabled',
    value: 'cloud-platform',
  }
]

const bigtableData = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.readOnly',
    value: 'bigtable.data.readonly',
  },
  {
    label: 'generic.readWrite',
    value: 'bigtable.data.readonly',
  },
]

const bigtableAdmin = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'clusterNew.googlegke.tablesOnly',
    value: 'bigtable.admin.table',
  },
  {
    label: 'generic.full',
    value: 'bigtable.admin',
  },
]

const cloudPub = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.enabled',
    value: 'pubsub',
  }
]

const serviceControl = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.enabled',
    value: 'servicecontrol',
  }
]

const serviceManagement = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.readOnly',
    value: 'service.management.readonly',
  },
  {
    label: 'generic.readWrite',
    value: 'service.management',
  },
]

const stackdriverTrace = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.readOnly',
    value: 'trace.readonly',
  },
  {
    label: 'generic.writeOnly',
    value: 'trace.append',
  },
]

const cloudSourceRepositories = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.readOnly',
    value: 'source.read_only',
  },
  {
    label: 'generic.readWrite',
    value: 'source.read_write',
  },
  {
    label: 'generic.full',
    value: 'source.full_control',
  },
]

const cloudDebugger = [
  {
    label: 'generic.none',
    value: 'none'
  },
  {
    label: 'generic.enabled',
    value: 'cloud_debugger',
  }
]

export default Component.extend({
  layout,

  userInfoContent:                 userInfo,
  computeEngineContent:            computeEngine,
  storageContent:                  storage,
  taskQueueContent:                taskQueue,
  bigQueryContent:                 bigQuery,
  cloudSQLContent:                 cloudSQL,
  cloudDatastoreContent:           cloudDatastore,
  stackdriverLoggingAPIContent:    stackdriverLoggingAPI,
  stackdriverMonitoringAPIContent: stackdriverMonitoringAPI,
  cloudPlatformContent:            cloudPlatform,
  bigtableDataContent:             bigtableData,
  bigtableAdminContent:            bigtableAdmin,
  cloudPubContent:                 cloudPub,
  serviceControlContent:           serviceControl,
  serviceManagementContent:        serviceManagement,
  stackdriverTraceContent:         stackdriverTrace,
  cloudSourceRepositoriesContent:  cloudSourceRepositories,
  cloudDebuggerContent:            cloudDebugger,
});
