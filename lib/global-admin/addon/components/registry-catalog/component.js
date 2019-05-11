import Component from '@ember/component';
import layout from './template';
import { get, set, computed, setProperties } from '@ember/object';
import CrudCatalog from 'shared/mixins/crud-catalog';
import { inject as service } from '@ember/service';
import { requiredError } from 'shared/utils/util';
import C from 'ui/utils/constants';

const INGRESS_HOSTS_CORE = 'expose.ingress.host';
const DEFAULT_ADMIN_PASSWORD = 'Harbor12345';
const APP_VERSION = 'catalog://?catalog=system-library&template=harbor&version=0.0.1';

const STORAGE_TYPE = ['filesystem', 's3'];
const S3_REGION = C.AWS_S3_REGIONS;
const ACCESS_MODE = ['ReadWriteOnce']
const RDISE_EXTENNAL_KEYS = ['host', 'port', 'coreDatabaseIndex', 'jobserviceDatabaseIndex', 'registryDatabaseIndex', 'password']
const PERSISTENCE_KEYS = ['existingClaim', 'size', 'storageClass']
const DATABASE_EXTERNAL_KEYS = ['host', 'port', 'username', 'password', 'coreDatabase', 'clairDatabase', 'notaryServerDatabase', 'notarySignerDatabase', 'sslmode']
const S3_KEYS = ['region', 'bucket', 'accesskey', 'secretkey', 'regionendpoint']
const DATABASE_TYPE = ['internal', 'external']
const SSL_MODE = C.POSTGRESQL_SSL_MODE;
const PERSISTENCE_COMPONENTS = ['redis', 'registry', 'database'];

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
}

export default Component.extend(CrudCatalog, {
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

  init() {
    this._super(...arguments);
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

      const hiddenAnswers = HIDDEN_KEYS
      let answers = { ...hiddenAnswers };

      const answerKeys = Object.keys(ANSWER_TO_CONFIG) || []

      answerKeys.map((key) => {
        const value = get(this, `config.${ ANSWER_TO_CONFIG[key] }`)

        answers[key] = value
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
      } else if (databaseType === 'internal') {
        this.willSavePersistence(answers, 'database')
      }

      if (redisType === 'external') {
        RDISE_EXTENNAL_KEYS.map((k) => {
          const key = `redis.external.${ k }`

          answers[key] = get(this, key)
        })
      } else if (redisType === 'internal') {
        this.willSavePersistence(answers, 'redis')
      }

      this.save(cb, answers, true);
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
              window.location.href = window.location.href;
            }, 1000);
          })
        })
        .catch((err) => {
          get(this, 'growl').fromError(get(err, 'body.message'));
        })
    },
  },

  dockerLogin: computed('app.answers', function() {
    const url = (get(this, 'app.answers') || HIDDEN_KEYS)[INGRESS_HOSTS_CORE];

    return `docker login --username=admin ${ url }`;
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
        databaseType:                'internal',
        redisType:                   'internal',
        secretKey:                   'add-your-secret0',
        storageType:                 'filesystem',
        password:                    DEFAULT_ADMIN_PASSWORD,
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

      let persistenceKeys = []

      PERSISTENCE_COMPONENTS.map((component) => PERSISTENCE_KEYS.map((k) => {
        persistenceKeys = [...persistenceKeys, `persistence.persistentVolumeClaim.${ component }.${ k }`]
      }))

      const arr = [...s3Keys, ...databaseExtenalKeys, ...redisExtenalKeys, ...persistenceKeys]

      Object.keys(answers).forEach((key) => {
        if (arr.includes(key)) {
          return set(this, key, answers[key])
        }

        if (Object.keys(HIDDEN_KEYS).includes(key)) {
          return
        }

        if (answerKeys.includes(key)) {
          return set(this, `config.${ ANSWER_TO_CONFIG[key] }`, answers[key])
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

    if (!get(this, 'config.storageType')) {
      errors.pushObject(requiredError('globalRegistryPage.config.storageType.label'))
    }
    const secretKey = get(this, 'config.secretKey')

    if (secretKey && secretKey.length !== 16) {
      errors.pushObject(intl.t('globalRegistryPage.config.secretKey.error'))
    }

    if (get(this, 'config.storageType') === 'filesystem') {
      errors.pushObjects(this.validatePV('registry'))
    }

    if (get(this, 'config.databaseType') === 'internal') {
      errors.pushObjects(this.validatePV('database'))
    }

    if (get(this, 'config.redisType') === 'internal') {
      errors.pushObjects(this.validatePV('redis'))
    }

    if (get(this, 'config.storageType') === 's3') {
      S3_KEYS.map((k) => {
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
      RDISE_EXTENNAL_KEYS.map((k) => {
        const key = `redis.external.${ k }`

        if (!get(this, key)) {
          errors.pushObject(requiredError(`globalRegistryPage.config.redis.external.${ k }.label`))
        }
      })
    }

    return errors.uniq()
  },

  willSavePersistence(answers, component) {
    PERSISTENCE_KEYS.map((k) => {
      const key = `persistence.persistentVolumeClaim.${ component }.${ k }`
      const useStorageClass = get(this, `use${ component.charAt(0).toUpperCase() + component.substr(1) }StorageClass`)

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

    if (get(this, `use${ component.charAt(0).toUpperCase() + component.substr(1) }StorageClass`)) {
      if (defaultStorageClasses.length === 0 && !get(this, `persistence.persistentVolumeClaim.${ component }.storageClass`)) {
        const emptyError = intl.t('globalRegistryPage.config.storageClass.emptyError')

        errors.pushObject(emptyError)
      }
    } else if (!get(this, `persistence.persistentVolumeClaim.${ component }.existingClaim`)){
      errors.pushObject(requiredError(`globalRegistryPage.config.${ component }.existingClaim.label`))
    }

    return errors
  },

  doneSaving() {
    this.setGlobalRegistryEnabled('true')
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
      get(this, 'growl').fromError('Error saving global-registry-enabled', err);
    })
  }
});
