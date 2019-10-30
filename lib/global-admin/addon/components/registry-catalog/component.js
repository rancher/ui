import Component from '@ember/component';
import layout from './template';
import {
  get, set, computed, setProperties, defineProperty, observer
} from '@ember/object';
import CrudCatalog from 'shared/mixins/crud-catalog';
import { inject as service } from '@ember/service';
import { requiredError } from 'shared/utils/util';
import C from 'ui/utils/constants';
import { ucFirst, convertToMillis } from 'shared/utils/util';
import ReservationCheck from 'shared/mixins/reservation-check';
import { parseSi } from 'shared/utils/parse-unit'

const INTERNAL = 'internal'

const INGRESS_HOSTS_CORE = 'expose.ingress.host';
const APP_VERSION = 'catalog://?catalog=system-library&template=harbor&version=1.7.5-rancher1';

const STORAGE_TYPE = ['filesystem', 's3'];
const S3_REGION = C.AWS_S3_REGIONS;
const ACCESS_MODE = ['ReadWriteOnce']
const RDISE_EXTENNAL_KEYS = ['host', 'port', 'jobserviceDatabaseIndex', 'registryDatabaseIndex', 'password']
const PERSISTENCE_KEYS = ['existingClaim', 'size', 'storageClass']
const DATABASE_EXTERNAL_KEYS = ['host', 'port', 'username', 'password', 'coreDatabase', 'clairDatabase', 'notaryServerDatabase', 'notarySignerDatabase', 'sslmode']
const S3_KEYS = ['region', 'bucket', 'accesskey', 'secretkey', 'regionendpoint']
const DATABASE_TYPE = [INTERNAL, 'external']
const SSL_MODE = C.POSTGRESQL_SSL_MODE;
const PERSISTENCE_COMPONENTS = ['redis', 'registry', 'database'];

const DATABASE_REQUEST_CPU = 'database.internal.resources.requests.cpu'
const DATABASE_REQUEST_MEM = 'database.internal.resources.requests.memory'
const DATABASE_LIMIT_CPU =   'database.internal.resources.limits.cpu'
const DATABASE_LIMIT_MEM =   'database.internal.resources.limits.memory'

const REDIS_REQUEST_CPU =    'redis.internal.resources.requests.cpu'
const REDIS_REQUEST_MEM =    'redis.internal.resources.requests.memory'
const REDIS_LIMIT_CPU =      'redis.internal.resources.limits.cpu'
const REDIS_LIMIT_MEM =      'redis.internal.resources.limits.memory'

const REGISTRY_REQUEST_CPU =    'registry.registry.resources.requests.cpu'
const REGISTRY_REQUEST_MEM =    'registry.registry.resources.requests.memory'
const REGISTRY_LIMIT_CPU =      'registry.registry.resources.limits.cpu'
const REGISTRY_LIMIT_MEM =      'registry.registry.resources.limits.memory'

const CLAIR_REQUEST_CPU =    'clair.resources.requests.cpu'
const CLAIR_REQUEST_MEM =    'clair.resources.requests.memory'
const CLAIR_LIMIT_CPU =      'clair.resources.limits.cpu'
const CLAIR_LIMIT_MEM =      'clair.resources.limits.memory'

const NOTARY_REQUEST_CPU =    'notary.server.resources.requests.cpu'
const NOTARY_REQUEST_MEM =    'notary.server.resources.requests.memory'
const NOTARY_LIMIT_CPU =      'notary.server.resources.limits.cpu'
const NOTARY_LIMIT_MEM =      'notary.server.resources.limits.memory'

const SIGNER_REQUEST_CPU =    'notary.signer.resources.requests.cpu'
const SIGNER_REQUEST_MEM =    'notary.signer.resources.requests.memory'
const SIGNER_LIMIT_CPU =      'notary.signer.resources.limits.cpu'
const SIGNER_LIMIT_MEM =      'notary.signer.resources.limits.memory'

const REGISTRY_NODE_SELECTOR_PREFIX  = 'registry.nodeSelector.'
const DATABASE_NODE_SELECTOR_PREFIX  = 'database.internal.nodeSelector.'
const REDIS_NODE_SELECTOR_PREFIX     = 'redis.internal.nodeSelector.'
const CLAIR_NODE_SELECTOR_PREFIX     = 'clair.nodeSelector.'
const NOTARY_NODE_SELECTOR_PREFIX     = 'notary.nodeSelector.'

const WORKLOADS = ['database', 'redis', 'registry', 'clair', 'notaryServer', 'notarySigner']

const HIDDEN_KEYS = {
  'externalURL':         `https://${ window.location.host }`,
  [INGRESS_HOSTS_CORE]:  window.location.host,
  'persistence.type':    'storageClass',
}

const ANSWER_TO_CONFIG = {
  secretKey:                'secretKey',
  'imageChartStorage.type': 'storageType',
  'database.type':          'databaseType',
  'redis.type':             'redisType',
  'clair.enabled':          'clairEnabled',
  'notary.enabled':         'notaryEnabled',
  'harborAdminPassword':    'password',
  [DATABASE_REQUEST_CPU]:   'databaseRequestCpu',
  [DATABASE_REQUEST_MEM]:   'databaseRequestMemory',
  [DATABASE_LIMIT_CPU]:     'databaseLimitCpu',
  [DATABASE_LIMIT_MEM]:     'databaseLimitMemory',
  [REDIS_REQUEST_CPU]:      'redisRequestCpu',
  [REDIS_REQUEST_MEM]:      'redisRequestMemory',
  [REDIS_LIMIT_CPU]:        'redisLimitCpu',
  [REDIS_LIMIT_MEM]:        'redisLimitMemory',
  [REGISTRY_REQUEST_CPU]:   'registryRequestCpu',
  [REGISTRY_REQUEST_MEM]:   'registryRequestMemory',
  [REGISTRY_LIMIT_CPU]:     'registryLimitCpu',
  [REGISTRY_LIMIT_MEM]:     'registryLimitMemory',
  [CLAIR_REQUEST_CPU]:      'clairRequestCpu',
  [CLAIR_REQUEST_MEM]:      'clairRequestMemory',
  [CLAIR_LIMIT_CPU]:        'clairLimitCpu',
  [CLAIR_LIMIT_MEM]:        'clairLimitMemory',
  [NOTARY_REQUEST_CPU]:     'notaryServerRequestCpu',
  [NOTARY_REQUEST_MEM]:     'notaryServerRequestMemory',
  [NOTARY_LIMIT_CPU]:       'notaryServerLimitCpu',
  [NOTARY_LIMIT_MEM]:       'notaryServerLimitMemory',
  [SIGNER_REQUEST_CPU]:     'notarySignerRequestCpu',
  [SIGNER_REQUEST_MEM]:     'notarySignerRequestMemory',
  [SIGNER_LIMIT_CPU]:       'notarySignerLimitCpu',
  [SIGNER_LIMIT_MEM]:       'notarySignerLimitMemory',
}

export default Component.extend(CrudCatalog, ReservationCheck, {
  intl:        service(),
  globalStore: service(),
  growl:       service(),

  layout,

  answers:    null,
  appName:    'global-registry',
  nsName:     'cattle-system',
  appVersion: APP_VERSION,
  nsExists:   true,
  config:     null,

  level:                 'cluster',
  clusterLevelMinCpu:    500,
  clusterLevelMinMemory: 500,

  init() {
    this._super(...arguments);

    this.initWorkloads();

    if (get(this, 'showForm')) {
      this.initConfig()
    } else {
      this.clearTimeOut()
      const { globalRegistryEnabled = {} } = this

      setProperties(this, {
        enabled: globalRegistryEnabled.value === 'true',
        ready:   true,
      })
    }
  },

  actions: {
    save(cb) {
      set(this, 'errors', [])
      const errors = this.validate() || []

      if (errors.length > 0) {
        set(this, 'errors', errors)
        cb()

        return
      }

      let answers = { ...HIDDEN_KEYS };

      const answerKeys = Object.keys(ANSWER_TO_CONFIG) || []

      answerKeys.map((key) => {
        const value = get(this, `config.${ ANSWER_TO_CONFIG[key] }`)

        if ( value === undefined || value === '' ) {
          return;
        }

        switch (key) {
        case DATABASE_REQUEST_CPU:
        case DATABASE_LIMIT_CPU:
        case REDIS_REQUEST_CPU:
        case REDIS_LIMIT_CPU:
        case REGISTRY_REQUEST_CPU:
        case REGISTRY_LIMIT_CPU:
        case CLAIR_REQUEST_CPU:
        case CLAIR_LIMIT_CPU:
        case NOTARY_REQUEST_CPU:
        case NOTARY_LIMIT_CPU:
        case SIGNER_REQUEST_CPU:
        case SIGNER_LIMIT_CPU:
          answers[key] = `${ value }m`
          break;
        case DATABASE_REQUEST_MEM:
        case DATABASE_LIMIT_MEM:
        case REDIS_REQUEST_MEM:
        case REDIS_LIMIT_MEM:
        case REGISTRY_REQUEST_MEM:
        case REGISTRY_LIMIT_MEM:
        case CLAIR_REQUEST_MEM:
        case CLAIR_LIMIT_MEM:
        case NOTARY_REQUEST_MEM:
        case NOTARY_LIMIT_MEM:
        case SIGNER_REQUEST_MEM:
        case SIGNER_LIMIT_MEM:
          answers[key] = `${ value }Mi`
          break;
        default:
          answers[key] = value
        }
      })

      const {
        databaseType, redisType, storageType
      } = get(this, 'config')

      if (storageType === 's3') {
        S3_KEYS.map((k) => {
          const key = `imageChartStorage.s3.${ k }`

          answers[key] = get(this, key)
        })
      } else if (storageType === 'filesystem') {
        this.willSavePersistence(answers, 'registry')
      }

      if (databaseType === 'external') {
        DATABASE_EXTERNAL_KEYS.map((k) => {
          const key = `database.external.${ k }`

          answers[key] = get(this, key)
        })
      } else if (databaseType === INTERNAL) {
        this.willSavePersistence(answers, 'database')
      }

      if (redisType === 'external') {
        RDISE_EXTENNAL_KEYS.map((k) => {
          const key = `redis.external.${ k }`

          answers[key] = get(this, key)
        })

        answers['redis.external.coreDatabaseIndex'] = '0'
      } else if (redisType === INTERNAL) {
        this.willSavePersistence(answers, 'redis')
      }

      ['registry', 'database', 'redis', 'clair', 'notary'].map((component) => {
        (get(this, `${ component }NodeSelectors`) || []).map((selector) => {
          let { key, value } = selector

          if (key.includes('.')) {
            key = key.replace(/\./g, '\\.')
          }

          if (component === 'registry') {
            answers[`registry.nodeSelector.${ key }`] = value
          } else if (['database', 'redis'].includes(component) && get(this, `config.${ component }Type`) === INTERNAL) {
            answers[`${ component }.internal.nodeSelector.${ key }`] = value
          } else if (['clair', 'notary'].includes(component) && get(this, `config.${ component }Enabled`)) {
            answers[`${ component }.nodeSelector.${ key }`] = value
          }
        });
      })

      this.save(cb, answers);
    },

    disable() {
      const url = get(this, 'app.links.self');

      get(this, 'globalStore')
        .rawRequest({
          url,
          method: 'DELETE',
        })
        .then(() => {
          this.setGlobalRegistryEnabled('false', () => {
            setTimeout(() => {
              window.location.href = window.location.href; // eslint-disable-line no-self-assign
            }, 1000);
          })
        })
        .catch((err) => {
          get(this, 'growl').fromError(get(err, 'body.message'));
        })
    },
  },

  workloadEnabledChange: observer('config.clairEnabled', 'config.notaryEnabled', 'config.databaseType', 'config.redisType', 'config.storageType', function() {
    ['clair', 'notary'].map((w) => {
      if (!get(this, `config.${ w }Enabled`)) {
        set(this, `${ w }NodeSelectors`, [])
      }
    });
    ['database', 'redis'].map((w) => {
      if (get(this, `config.${ w }Type`) === 'external') {
        set(this, `${ w }NodeSelectors`, [])
      }
    });
    set(this, `registryNodeSelectors`, [])

    this.notifyPropertyChange('requestsCpu')
    this.notifyPropertyChange('requestsMemory')
    this.notifyPropertyChange('saveDisabled')
  }),

  dockerLogin: computed('app.answers', function() {
    const url = (get(this, 'app.answers') || HIDDEN_KEYS)[INGRESS_HOSTS_CORE];
    const username = get(this, 'showForm') ? 'admin' : 'USERNAME'

    return `docker login --username=${ username } ${ url }`;
  }),

  dockerPull: computed('app.answers', function() {
    const url = (get(this, 'app.answers') || HIDDEN_KEYS)[INGRESS_HOSTS_CORE];

    return `docker pull ${ url }/REPO_NAME/IMAGE_NAME[:TAG]`;
  }),

  dockerTag: computed('app.answers', function() {
    const url = (get(this, 'app.answers') || HIDDEN_KEYS)[INGRESS_HOSTS_CORE];

    return `docker tag SOURCE_IMAGE[:TAG] ${ url }/REPO_NAME/IMAGE_NAME[:TAG]`;
  }),

  dockerPush: computed('app.answers', function() {
    const url = (get(this, 'app.answers') || HIDDEN_KEYS)[INGRESS_HOSTS_CORE];

    return `docker push ${ url }/REPO_NAME/IMAGE_NAME[:TAG]`;
  }),

  storageTypeContent: computed(() => {
    return STORAGE_TYPE.map((value) => ({
      label: value,
      value
    }))
  }),

  s3RegionContent: computed(() => {
    return S3_REGION.map((value) => ({
      label: value,
      value
    }))
  }),

  accessModeContent: computed(() => {
    return ACCESS_MODE.map((value) => ({
      label: value,
      value
    }))
  }),

  databaseTypeContent: computed(() => {
    return DATABASE_TYPE.map((value) => ({
      label: value,
      value
    }))
  }),

  sslmodeContent: computed(() => {
    return SSL_MODE.map((value) => ({
      label: value,
      value
    }))
  }),

  persistentVolumeChoices: computed('persistentVolumeClaims.[]', function() {
    return (get(this, 'persistentVolumeClaims') || []).map((s) => ({
      label: s.name,
      value: s.id
    }))
  }),

  requestsCpu: computed('config.redisRequestCpu', 'config.databaseRequestCpu', 'config.registryRequestCpu', 'config.notaryServerRequestCpu', 'config.calirRequestCpu', 'config.notarySignerRequestCpu', function() {
    return WORKLOADS
      .filter((w) => {
        if (['notaryServer', 'notarySigner'].includes(w) && !get(this, `config.notaryEnabled`)) {
          return false
        } else if (w === 'clair' && !get(this, `config.clairEnabled`)) {
          return false
        } else if (['redis', 'database'].includes(w) && get(this, `config.${ w }Type`) === 'external') {
          return false
        }

        return true
      })
      .reduce((all, w) => {
        return all + parseInt(get(this, `config.${ w }RequestCpu`) || 0)
      }, 0)
  }),

  requestsMemory: computed('config.redisRequestMemory', 'config.databaseRequestMemory', 'config.registryRequestMemory', 'config.clairRequestMemory', 'config.notaryServerRequestMemory', 'config.notarySignerRequestMemory', function() {
    return WORKLOADS
      .filter((w) => {
        if (['notaryServer', 'notarySigner'].includes(w) && !get(this, `config.notaryEnabled`)) {
          return false
        } else if (w === 'clair' && !get(this, `config.clairEnabled`)) {
          return false
        } else if (['redis', 'database'].includes(w) && get(this, `config.${ w }Type`) === 'external') {
          return false
        }

        return true
      })
      .reduce((all, w) => {
        return all + parseInt(get(this, `config.${ w }RequestMemory`) || 0)
      }, 0)
  }),

  globalRegistryWarning: computed('insufficientCpu', 'insufficientMemory', function() {
    let {
      insufficientCpu, insufficientMemory, intl, minCpu, minMemory, enabled
    } = this
    const prefix = 'globalRegistryPage.insufficientSize.total'
    const action = enabled ? 'update' : 'enable'

    if (insufficientCpu && insufficientMemory) {
      return intl.t(`${ prefix }.all`, {
        minCpu,
        minMemory,
        action,
      })
    } else if (insufficientCpu) {
      return intl.t(`${ prefix }.cpu`, {
        minCpu,
        action,
      })
    } else if (insufficientMemory) {
      return intl.t(`${ prefix }.memory`, {
        minMemory,
        action,
      })
    }
  }),

  saveDisabled: computed('globalRegistryWarning', 'databaseWarning', 'redisWarning', 'registryWarning', 'clairWarning', 'notaryWarning', 'notarySignerWarning', 'notaryServerWarning', function() {
    return [...WORKLOADS, 'notary'].reduce((out, w) => {
      if (w === 'clair' && get(this, `config.clairEnabled`)) {
        return out || (get(this, `${ w }Warning`) || false)
      } else if (['database', 'redis'].includes(w) && get(this, `config.${ w }Type`) === 'internal') {
        return out || (get(this, `${ w }Warning`) || false)
      } else if (['notary', 'notaryServer', 'notarySigner'].includes(w) && get(this, `config.notaryEnabled`)) {
        return out || (get(this, `${ w }Warning`) || false)
      } else {
        return out || (get(this, `${ w }Warning`) || false)
      }
    }, false) || get(this, 'globalRegistryWarning')
  }),

  notarySchedulableNodes: computed('notaryNodeSelectors.[]', 'cluster.nodes.@each.{allocatable,requested}', 'config.notaryEnabled', function() {
    if (!get(this, 'config.notaryEnabled')) {
      return []
    } else {
      return this.getSchedulableNodes('notary')
    }
  }),

  insufficientNotaryCpu: computed(`notarySchedulableNodes.@each.{allocatable,requested}`, `config.notaryServerRequestCpu`, 'config.notarySignerRequestCpu', 'cluster.nodes.@each.{allocatable,requested}', function() {
    const reservation = Math.max(parseInt(get(this, 'config.notaryServerRequestCpu') || '0'), parseInt(get(this, 'config.notarySignerRequestCpu') || '0'))

    return this.getComponentInsufficient('notary', 'cpu', reservation)
  }),

  insufficientNotaryMemory: computed(`notarySchedulableNodes.@each.{allocatable,requested}`, `config.notaryServerRequestMemory`, 'config.notarySignerRequestMemory', 'cluster.nodes.@each.{allocatable,requested}', function() {
    const reservation = Math.max(parseInt(get(this, 'config.notaryServerRequestMemory') || '0'), parseInt(get(this, 'config.notarySignerRequestMemory') || '0'))

    return this.getComponentInsufficient('notary', 'memory', reservation)
  }),

  notaryWarning: computed(`insufficientNotaryCpu`, `insufficientNotaryMemory`, function() {
    if (!get(this, 'config.notaryEnabled')) {
      return
    }
    const componentCpu = Math.max(parseInt(get(this, 'config.notaryServerRequestCpu') || '0'), parseInt(get(this, 'config.notarySignerRequestCpu') || '0'))
    const componentMemory = Math.max(parseInt(get(this, 'config.notaryServerRequestMemory') || '0'), parseInt(get(this, 'config.notarySignerRequestMemory') || '0'))

    return this.getComponentWarning('notary', componentCpu, componentMemory, get(this, 'intl').t('globalRegistryPage.notaryAndSigner'))
  }),

  initConfig() {
    const customAnswers = {};

    setProperties(this, {
      redis:       { external: {}, },
      persistence: {
        persistentVolumeClaim: {
          registry:    {},
          redis:       {},
          database:    {},
        }
      },
      database:          { external: {}, },
      imageChartStorage: { s3: {}, },
      secretKeyQuestion: {
        minLength:  16,
        maxLength:  16,
        validChars: 'alphanum',
      },
      config: {
        clairEnabled:                true,
        notaryEnabled:               true,
        databaseType:                INTERNAL,
        redisType:                   INTERNAL,
        storageType:                 'filesystem',
        databaseRequestCpu:          100,
        databaseRequestMemory:       256,
        databaseLimitCpu:            500,
        databaseLimitMemory:         2048,
        redisRequestCpu:             100,
        redisRequestMemory:          256,
        redisLimitCpu:               500,
        redisLimitMemory:            2048,
        registryRequestCpu:          100,
        registryRequestMemory:       256,
        registryLimitCpu:            1000,
        registryLimitMemory:         2048,
        clairRequestCpu:             100,
        clairRequestMemory:          256,
        clairLimitCpu:               500,
        clairLimitMemory:            2048,
        notaryServerRequestCpu:            100,
        notaryServerRequestMemory:         256,
        notaryServerLimitCpu:              500,
        notaryServerLimitMemory:           2048,
        notarySignerRequestCpu:            100,
        notarySignerRequestMemory:         256,
        notarySignerLimitCpu:              500,
        notarySignerLimitMemory:           2048,
      },
      'database.external.sslmode':                         'disable',
      'database.external.coreDatabase':                    'registry',
      'database.external.clairDatabase':                   'clair',
      'database.external.notaryServerDatabase':            'notary_server',
      'database.external.notarySignerDatabase':            'notary_signer',
      'database.external.port':                            '5432',
      'redis.external.port':                               '6379',
      'persistence.persistentVolumeClaim.registry.size':   '100Gi',
      'persistence.persistentVolumeClaim.redis.size':      '5Gi',
      'persistence.persistentVolumeClaim.database.size':   '5Gi',
      useRedisStorageClass:                                true,
      useDatabaseStorageClass:                             true,
      useRegistryStorageClass:                             true,
    })

    if ( get(this, 'enabled') ) {
      const answers = get(this, 'app.answers') || {};
      const s3Keys = S3_KEYS.map((k) => `imageChartStorage.s3.${ k }`)
      const databaseExtenalKeys = DATABASE_EXTERNAL_KEYS.map((k) => `database.external.${ k }`)
      const redisExtenalKeys = RDISE_EXTENNAL_KEYS.map((k) => `redis.external.${ k }`)
      const answerKeys = Object.keys(ANSWER_TO_CONFIG) || []

      const registryNodeSelector = {}
      const databaseNodeSelector = {};
      const redisNodeSelector = {}
      const clairNodeSelector = {}
      const notaryNodeSelector = {}

      Object.keys(answers).filter((key) => key.startsWith(DATABASE_NODE_SELECTOR_PREFIX) ).map((k) => {
        const value = answers[k] || '';
        const key = k.replace(DATABASE_NODE_SELECTOR_PREFIX, '').replace(/\\\./g, '.')

        databaseNodeSelector[key] = value
      })

      Object.keys(answers).filter((key) => key.startsWith(REDIS_NODE_SELECTOR_PREFIX) ).map((k) => {
        const value = answers[k] || '';
        const key = k.replace(REDIS_NODE_SELECTOR_PREFIX, '').replace(/\\\./g, '.')

        redisNodeSelector[key] = value
      });

      Object.keys(answers).filter((key) => key.startsWith(REGISTRY_NODE_SELECTOR_PREFIX) ).map((k) => {
        let value = answers[k] || '';
        const key = k.replace(REGISTRY_NODE_SELECTOR_PREFIX, '').replace(/\\\./g, '.')

        registryNodeSelector[key] = value
      });

      Object.keys(answers).filter((key) => key.startsWith(CLAIR_NODE_SELECTOR_PREFIX) ).map((k) => {
        let value = answers[k] || '';
        const key = k.replace(CLAIR_NODE_SELECTOR_PREFIX, '').replace(/\\\./g, '.')

        clairNodeSelector[key] = value
      });

      Object.keys(answers).filter((key) => key.startsWith(NOTARY_NODE_SELECTOR_PREFIX) ).map((k) => {
        let value = answers[k] || '';
        const key = k.replace(NOTARY_NODE_SELECTOR_PREFIX, '').replace(/\\\./g, '.')

        notaryNodeSelector[key] = value
      });

      this.updateCpuMemoryPreRequest();

      setProperties(this, {
        registryNodeSelector,
        databaseNodeSelector,
        redisNodeSelector,
        clairNodeSelector,
        notaryNodeSelector,
      })

      let persistenceKeys = []

      PERSISTENCE_COMPONENTS.map((component) => PERSISTENCE_KEYS.map((k) => {
        persistenceKeys = [...persistenceKeys, `persistence.persistentVolumeClaim.${ component }.${ k }`]
      }))

      const arr = [...s3Keys, ...databaseExtenalKeys, ...redisExtenalKeys, ...persistenceKeys]

      Object.keys(answers).forEach((key) => {
        if (key.startsWith(REGISTRY_NODE_SELECTOR_PREFIX)
            || key.startsWith(DATABASE_NODE_SELECTOR_PREFIX)
            || key.startsWith(REDIS_NODE_SELECTOR_PREFIX)
            || key.startsWith(CLAIR_NODE_SELECTOR_PREFIX)
            || key.startsWith(NOTARY_NODE_SELECTOR_PREFIX)
        ) {
          return
        }

        if (arr.includes(key)) {
          return set(this, key, answers[key])
        }

        if (Object.keys(HIDDEN_KEYS).includes(key) || key === 'redis.external.coreDatabaseIndex') {
          return
        }

        if (answerKeys.includes(key)) {
          let value

          switch (key) {
          case DATABASE_REQUEST_CPU:
          case DATABASE_LIMIT_CPU:
          case REDIS_REQUEST_CPU:
          case REDIS_LIMIT_CPU:
          case REGISTRY_REQUEST_CPU:
          case REGISTRY_LIMIT_CPU:
          case CLAIR_REQUEST_CPU:
          case CLAIR_LIMIT_CPU:
          case NOTARY_REQUEST_CPU:
          case NOTARY_LIMIT_CPU:
          case SIGNER_REQUEST_CPU:
          case SIGNER_LIMIT_CPU:
            value = convertToMillis(answers[key] || '0')
            break;
          case DATABASE_REQUEST_MEM:
          case DATABASE_LIMIT_MEM:
          case REDIS_REQUEST_MEM:
          case REDIS_LIMIT_MEM:
          case REGISTRY_REQUEST_MEM:
          case REGISTRY_LIMIT_MEM:
          case CLAIR_REQUEST_MEM:
          case CLAIR_LIMIT_MEM:
          case NOTARY_REQUEST_MEM:
          case NOTARY_LIMIT_MEM:
          case SIGNER_REQUEST_MEM:
          case SIGNER_LIMIT_MEM:
            value = parseSi(answers[key] || '0', 1024) / 1048576
            break;
          default:
            value = answers[key]
          }

          return set(this, `config.${ ANSWER_TO_CONFIG[key] }`, value)
        }

        customAnswers[key] = answers[key];
      });
    }

    set(this, 'customAnswers', customAnswers);
  },

  validate() {
    const errors = []
    const intl = get(this, 'intl')

    const customAnswers = get(this, 'customAnswers')
    const exposeIngressHost = customAnswers[INGRESS_HOSTS_CORE] || window.location.host

    if (/^[0-9.:]+$/.test(exposeIngressHost)) {
      errors.pushObject(intl.t('globalRegistryPage.config.exposeIngressHost.error', { hostName: exposeIngressHost }))
    }

    if (!get(this, 'config.password')) {
      errors.pushObject(requiredError('globalRegistryPage.setting.adminPassword.label'))
    }

    const secretKey = get(this, 'config.secretKey')

    if (secretKey && secretKey.length !== 16) {
      errors.pushObject(intl.t('globalRegistryPage.config.secretKey.error'))
    }

    if (get(this, 'config.storageType') === 'filesystem') {
      errors.pushObjects(this.validatePV('registry'))
    }
    errors.pushObjects(this.validateLimitAndRequest('registry'))

    if (get(this, 'config.databaseType') === INTERNAL) {
      errors.pushObjects(this.validatePV('database'))
      errors.pushObjects(this.validateLimitAndRequest('database'))
    }

    if (get(this, 'config.redisType') === INTERNAL) {
      errors.pushObjects(this.validatePV('redis'))
      errors.pushObjects(this.validateLimitAndRequest('redis'))
    }

    if (get(this, 'config.storageType') === 's3') {
      S3_KEYS
        .filter((k) => k !== 'regionendpoint')
        .map((k) => {
          const key = `imageChartStorage.s3.${ k }`

          if (!get(this, key)) {
            errors.pushObject(requiredError(`globalRegistryPage.config.s3.${ k }.label`))
          }
        })
    }

    if (get(this, 'config.databaseType') === 'external') {
      DATABASE_EXTERNAL_KEYS.map((k) => {
        const key = `database.external.${ k }`

        if (!get(this, key)) {
          errors.pushObject(requiredError(`globalRegistryPage.config.database.external.${ k }.label`))
        }
      })
    }

    if (get(this, 'config.redisType') === 'external') {
      RDISE_EXTENNAL_KEYS
        .filter((k) => k !== 'password')
        .map((k) => {
          const key = `redis.external.${ k }`

          if (!get(this, key)) {
            errors.pushObject(requiredError(`globalRegistryPage.config.redis.external.${ k }.label`))
          }
        })
    }

    if (get(this, 'config.notaryEnabled')) {
      errors.pushObjects(this.validateLimitAndRequest('notaryServer'))
      errors.pushObjects(this.validateLimitAndRequest('notarySigner'))
    }
    if (get(this, 'config.clairEnabled')) {
      errors.pushObjects(this.validateLimitAndRequest('clair'))
    }

    return errors.uniq()
  },

  willSavePersistence(answers, component) {
    PERSISTENCE_KEYS.map((k) => {
      const key = `persistence.persistentVolumeClaim.${ component }.${ k }`
      const useStorageClass = get(this, `use${ ucFirst(component) }StorageClass`)

      if (['storageClass', 'size'].includes(k) && useStorageClass) {
        answers[key] = get(this, key)
      }
      if (k === 'existingClaim' && !useStorageClass) {
        answers[key] = get(this, key)
      }
    })
  },

  validatePV(component) {
    const { storageClasses = [], intl } = this
    const errors = []

    const defaultStorageClasses = storageClasses.filter((s) => s.annotations && (s.annotations['storageclass.kubernetes.io/is-default-class'] === 'true' || s.annotations['storageclass.beta.kubernetes.io/is-default-class'] === 'true'))

    if (get(this, `use${ ucFirst(component) }StorageClass`)) {
      if (defaultStorageClasses.length === 0 && !get(this, `persistence.persistentVolumeClaim.${ component }.storageClass`)) {
        const emptyError = intl.t('globalRegistryPage.config.storageClass.emptyError')

        errors.pushObject(emptyError)
      }

      if (!get(this, `persistence.persistentVolumeClaim.${ component }.size`)) {
        errors.pushObject(intl.t('globalRegistryPage.config.storageClass.sizeRequired', { component: ucFirst(component) }))
      }
    } else if (!get(this, `persistence.persistentVolumeClaim.${ component }.existingClaim`)){
      errors.pushObject(requiredError(`clusterIstioPage.existingClaim.label`, { component: ucFirst(component) }))
    }

    return errors
  },

  doneSaving() {
    this.setGlobalRegistryEnabled('true');
    this.updateCpuMemoryPreRequest();
  },

  setGlobalRegistryEnabled(value, successCB) {
    const globalStore = get(this, 'globalStore')
    const globalRegistryEnabled = globalStore.all('setting').findBy('id', 'global-registry-enabled')

    set(globalRegistryEnabled, 'value', value)
    globalRegistryEnabled.save().then(() => {
      if (successCB) {
        successCB()
      }
    }).catch((err) => {
      get(this, 'growl').fromError(get(this, 'intl').t('globalRegistryPage.globalRegistryEnabled.error'), err);
    })
  },

  initWorkloads() {
    WORKLOADS.map((w) => {
      defineProperty(this, `${ w }SchedulableNodes`, computed(`${ w }NodeSelectors.[]`, 'cluster.nodes.@each.{allocatable,requested}', `config.${ w }Enabled`, () => {
        return this.getSchedulableNodes(w)
      }));

      defineProperty(this, `insufficient${ ucFirst(w) }Cpu`, computed(`${ w }SchedulableNodes.@each.{allocatable,requested}`, `config.${ w }RequestCpu`, 'cluster.nodes.@each.{allocatable,requested}', () => {
        return this.getComponentInsufficient(w, 'cpu')
      }))

      defineProperty(this, `insufficient${ ucFirst(w) }Memory`, computed(`${ w }SchedulableNodes.@each.{allocatable,requested}`, `config.${ w }RequestMemory`, 'cluster.nodes.@each.{allocatable,requested}', () => {
        return this.getComponentInsufficient(w, 'memory')
      }))

      defineProperty(this, `${ w }Warning`, computed(`insufficient${ ucFirst(w) }Cpu`, `insufficient${ ucFirst(w) }Memory`, () => {
        return this.getComponentWarning(w)
      }))
    });
  },

  getEnalbedWorkloads(answers) {
    let out = ['registry.registry']

    if (answers['redis.type'] === 'internal') {
      out.push('redis.internal')
    }
    if (answers['database.type'] === 'internal') {
      out.push('database.internal')
    }
    if (answers['notary.enabled'] === 'true') {
      out = [...out, 'notary.server', 'notary.signer']
    }
    if (answers['clair.enabled'] === 'true') {
      out.push('clair')
    }

    return out;
  }
});
