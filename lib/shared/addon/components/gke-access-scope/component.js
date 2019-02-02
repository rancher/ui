import Component from '@ember/component';
import layout from './template';

const userInfo = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Enabled',
    value: 'userinfo.email',
  }
]

const computeEngine = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Read Only',
    value: 'compute.readonly',
  },
  {
    label: 'Read Write',
    value: 'compute',
  },
]

const storage = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Read Only',
    value: 'devstorage.read_only',
  },
  {
    label: 'Write Only',
    value: 'devstorage.write_only',
  },
  {
    label: 'Read Write',
    value: 'devstorage',
  },
  {
    label: 'Full',
    value: 'devstorage.full_control',
  },
]

const taskQueue = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Enabled',
    value: 'taskqueue',
  }
]

const bigQuery = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Enabled',
    value: 'bigquery',
  }
]

const cloudSQL = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Enabled',
    value: 'sqlservice.admin',
  }
]

const cloudDatastore = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Enabled',
    value: 'clouddatastore',
  }
]

const stackdriverLoggingAPI = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Write Only',
    value: 'logging.write',
  },
  {
    label: 'Read Only',
    value: 'logging.read',
  },
  {
    label: 'Full',
    value: 'logging.admin',
  },
]

const stackdriverMonitoringAPI = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Write Only',
    value: 'monitoring.write',
  },
  {
    label: 'Read Only',
    value: 'monitoring.read',
  },
  {
    label: 'Full',
    value: 'monitoring',
  },
]

const cloudPlatform = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Enabled',
    value: 'cloud-platform',
  }
]

const bigtableData = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Read Only',
    value: 'bigtable.data.readonly',
  },
  {
    label: 'Read Write',
    value: 'bigtable.data.readonly',
  },
]

const bigtableAdmin = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Tables Only',
    value: 'bigtable.admin.table',
  },
  {
    label: 'Full',
    value: 'bigtable.admin',
  },
]

const cloudPub = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Enabled',
    value: 'pubsub',
  }
]

const serviceControl = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Enabled',
    value: 'servicecontrol',
  }
]

const serviceManagement = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Read Only',
    value: 'service.management.readonly',
  },
  {
    label: 'Read Write',
    value: 'service.management',
  },
]

const stackdriverTrace = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Read Only',
    value: 'trace.readonly',
  },
  {
    label: 'Write Write',
    value: 'trace.append',
  },
]

const cloudSourceRepositories = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Read Only',
    value: 'source.read_only',
  },
  {
    label: 'Read Write',
    value: 'source.read_write',
  },
  {
    label: 'Full',
    value: 'source.full_control',
  },
]

const cloudDebugger = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Enabled',
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
