import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  get, set, observer, setProperties, computed
} from '@ember/object';
import { reads, alias } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';
import parseUri from 'shared/utils/parse-uri';
import { resolve } from 'rsvp';
import { next, later } from '@ember/runloop';
import C from 'ui/utils/constants';
import { on } from '@ember/object/evented';
import Semver from 'semver';

const MIN_WINDOWS_NO_WARNING = '1.18.1';
const INVALID_PREFIX_CHAR = ['\\', '/', '*', '?', '"', '<', '>', '|', ` `, ',', '#'];

export default Component.extend(NewOrEdit, {
  scope:                   service(),
  settings:                service(),
  globalStore:             service(),
  intl:                    service(),
  // input
  errors:                  null,
  targetType:              null,
  configMap:               null,
  esEndpointValidate:      true,
  fluentdEndpointValidate:  true,
  esErrors:                [],
  pasteOrUpload:           false,
  testing:                 false,
  testOk:                  true,
  tested:                  false,

  pageScope:               reads('scope.currentPageScope'),
  cluster:                 reads('scope.currentCluster'),
  project:                 reads('scope.currentProject'),
  clusterTargetType:       reads('clusterLogging.targetType'),
  isWindows:               alias('scope.currentCluster.isWindows'),

  actions: {
    test() {
      if (get(this, 'testing') || get(this, 'tested')) {
        return resolve();
      }
      const clone = get(this, 'model').clone()

      const ok = this.willSave();

      if (!ok) {
        return resolve();
      }

      const data = get(this, 'model');
      const gs = get(this, 'globalStore');
      const pageScope = this.get('pageScope');

      set(this, 'testing', true);

      let url = `${ pageScope }loggings?action=test`

      if (get(this, 'targetType') === 'customTarget') {
        url = `${ pageScope }loggings?action=dryRun`
      }

      return gs.rawRequest({
        url,
        method: 'POST',
        data,
      }).then(() => {
        setProperties(this, {
          testOk:  true,
          errors:  null,
        });
      }).catch((xhr) => {
        setProperties(this, {
          testOk:  false,
          errors:  [get(xhr, 'body.message') || get(xhr, 'body.code')],
        });
      }).finally(() => {
        setProperties(this, {
          tested:  true,
          testing: false,
          model:   clone,
        })

        next(() => {
          later(() => {
            set(this, 'tested', false);
          }, 3000);
        });
      });
    },
    cancel() {
      setProperties(this, {
        targetType:    get(this, 'preTargetType'),
        pasteOrUpload: false,
      })
    },

    showPaste() {
      setProperties(this, {
        preTargetType: get(this, 'targetType'),
        targetType:    'customTarget',
        pasteOrUpload: true,
      })
    },
  },

  targetTypeChange: observer('targetType', function() {
    set(this, 'errors', [])
  }),

  pasteOrUploadChange: observer('pasteOrUpload', function() {
    const { fileObj, deepStrs = [] } = this.parseValue(get(this, 'customContent'))
    const preTargetType = get(this, 'preTargetType')

    if (!get(this, 'pasteOrUpload')) {
      const type = fileObj['@type']
      const targetType = this.fileToFormType(type)

      set(this, 'targetType', targetType)
    } else {
      let type = preTargetType

      switch (preTargetType) {
      case 'splunk':
        type = 'splunk_hec'
        break;
      case 'syslog':
        type = 'remote_syslog'
        break;
      case 'kafka':
        type = 'kafka_buffered'
        break;
      case 'fluentForwarder':
        type = 'forward'
        break;
      }
      set(fileObj, '@type', type)
      let body = ''
      let str = ''

      deepStrs.map((s) => {
        str += s
      })

      for (let key in fileObj) {
        body += `${ key } ${ fileObj[key] }
  `
      }
      const out = `<match *>
  ${ body }${ str }
</match>`

      set(this, 'customContent', out)
    }
  }),

  headerLabel: computed('pageScope', function() {
    const ps = get(this, 'pageScope');

    if (ps === 'cluster') {
      return 'loggingPage.clusterHeader';
    } else {
      return 'loggingPage.projectHeader';
    }
  }),

  isClusterLevel: computed('pageScope', function() {
    return get(this, 'pageScope') === 'cluster';
  }),

  saveDisabled: computed('originalModel.{id,targetType}', 'targetType', 'pasteOrUpload', function() {
    return get(this, 'originalModel.targetType') === 'none'
      && get(this, 'targetType') === 'none'
      && !get(this, 'pasteOrUpload');
  }),

  pageChange: on('init', observer('originalModel.customTargetConfig.content', function() {
    this.initCustomContent()
  })),

  showWindowsWarning: computed('scope.currentCluster.version.gitVersion', 'scope.currentCluster.isWindows', function() {
    const { scope: { currentCluster } } = this;
    const currentVersion = Semver.coerce(currentCluster.version.gitVersion);

    if (currentCluster.isWindows && currentCluster.isVxlan && Semver.lt(currentVersion, MIN_WINDOWS_NO_WARNING)) {
      return true;
    }

    return false;
  }),

  parseValue(value) {
    let fileObj = {}
    const removeMacth = value.replace(/.*<match.*>.*(\r\n|\n|\r) {2}/ig, '').replace(/(\r\n|\n|\r).*<\/match.*>/ig, '')
    const deepStrs = removeMacth.match(/<(.|\r\n|\n|\r)*<\/.*>/ig, '') || []
    const removedDeep = removeMacth.replace(/<(.|\r\n|\n|\r)*<\/.*>/ig, '')

    const myString = removedDeep.replace(/(\r\n|\n|\r)/gm, '<br />');
    const keyAndValue = myString.split('<br />').filter((f) => f !== '<br />').filter((f = '') => !f.startsWith('#') && !f.startsWith('<'))

    keyAndValue.map((item = '') => {
      const arr = item.split(' ').filter((f) => f !== '')

      if (arr[0] && arr[1]) {
        set(fileObj, arr[0], arr[1])
      }
    })

    return {
      fileObj,
      deepStrs
    }
  },

  willSave() {
    const {
      targetType, pageScope, model, intl
    } = this

    set(model, 'clusterId', get(this, 'cluster.id'));
    if (pageScope === 'project') {
      set(model, 'projectId', get(this, 'project.id'));
    }

    setProperties(model, {
      elasticsearchConfig:    null,
      splunkConfig:           null,
      kafkaConfig:            null,
      syslogConfig:           null,
      fluentForwarderConfig:  null,
      customTargetConfig:     null,
    });

    if (targetType === 'none') {
      return true;
    }

    const errors = set(this, 'errors', [])

    if (get(this, 'pasteOrUpload')) {
      const { fileObj } = this.parseValue(get(this, 'customContent'))

      const targetType = fileObj['@type']
      const types = Object.keys(C.LOGGING_TPYE_TO_CONFIG) || []

      if (!types.includes(targetType)) {
        errors.pushObject(intl.t('loggingPage.customTarget.type.error'))
      }

      setProperties(model, {
        customTargetConfig: {
          clientKey:   get(this, 'model.customTarget.config.clientKey'),
          clientCert:  get(this, 'model.customTarget.config.clientCert'),
          certificate: get(this, 'model.customTarget.config.certificate'),
          content:     (get(this, 'customContent') || '').replace(/.*<match.*>.*(\r\n|\n|\r) {2}/ig, '').replace(/(\r\n|\n|\r).*<\/match.*>/ig, ''),
        }
      })

      const {
        outputFlushInterval, outputTags, dockerRoot, includeSystemComponent
      } = get(this, 'model.customTarget');

      setProperties(model, {
        outputFlushInterval,
        outputTags,
        dockerRoot,
        includeSystemComponent,
      })
    } else {
      if (targetType === 'fluentForwarder') {
        const fluentServers = get(model, 'fluentForwarder.config.fluentServers') || [];
        let filter = fluentServers.filter((f) => !f.endpoint)

        if (filter.length > 0) {
          errors.pushObject(intl.t('loggingPage.fluentd.endpoint.required'))
        } else {
          if (!get(this, 'endpointValidate')) {
            errors.pushObject(intl.t('loggingPage.fluentd.endpoint.invalid'))
          }
        }

        filter = fluentServers.filter((f) => !f.standby)
        if (filter.length === 0) {
          errors.pushObject(intl.t('loggingPage.fluentd.standby.none'))
        }

        if (errors.length === 0) {
          const fluentConfig = get(model, 'fluentForwarder.config')
          const { enableTls, sslVerify } = fluentConfig

          if (enableTls) {
            if (!sslVerify) {
              set(fluentConfig, 'certificate', null)
            }
          } else {
            setProperties(fluentConfig, {
              certificate:   null,
              clientKey:     null,
              clientCert:    null,
              sslVerify:     false,
              clientKeyPass: null,
            })
          }
        }
      }

      let formatConfig = get(model, `${ targetType }.config`)

      // In case of type is `/v3/schema/${ targetType }Config`
      set(formatConfig, 'type', `${ targetType }Config`)

      setProperties(model, {
        outputFlushInterval:       get(model, `${ targetType }.outputFlushInterval`),
        outputTags:                get(model, `${ targetType }.outputTags`),
        dockerRoot:                get(model, `${ targetType }.dockerRoot`),
        [`${ targetType }Config`]: get(this, 'globalStore').createRecord(formatConfig),
        includeSystemComponent:    get(model, `${ targetType }.includeSystemComponent`),
      })

      if (targetType === 'elasticsearch') {
        const elasticsearchErrors = this.elasticsearchWillSave()

        errors.pushObjects(elasticsearchErrors)
      }

      if (targetType === 'splunk') {
        const splunkErrors = this.splunkWillSave()

        errors.pushObjects(splunkErrors)
      }

      if (targetType === 'kafka') {
        const kafkaErrors = this.kafkaWillSave()

        errors.pushObjects(kafkaErrors)
      }

      if (targetType === 'syslog') {
        const syslogErrors = this.syslogWillSave()

        errors.pushObjects(syslogErrors)
      }
    }

    if (errors.length > 0) {
      return false
    }

    return this._super(...arguments);
  },

  formatUrl(url) {
    const urlParser = parseUri(url) || {}

    if (!urlParser.port) {
      if (urlParser.protocol === 'http') {
        return `${ urlParser.protocol }://${ urlParser.host }:80`
      }
      if (urlParser.protocol === 'https') {
        return `${ urlParser.protocol }://${ urlParser.host }:443`
      }
    }

    return url
  },

  doneSaving(neu) {
    if (get(this, 'targetType') !== 'customTarget') {
      set(this, 'customContent', `<match *>\n</match>`)
    }

    setProperties(this, {
      model:         neu.clone().patch(),
      originalModel: neu.clone(),
    })
  },

  initCustomContent() {
    if (get(this, 'originalModel.targetType') === 'customTarget') {
      const { fileObj } = this.parseValue(get(this, 'originalModel.customTargetConfig.content'))
      const type = fileObj['@type']
      let preTargetType = this.fileToFormType(type)

      setProperties(this, {
        pasteOrUpload: true,
        customContent: `<match *>\n  ${ get(this, 'originalModel.customTargetConfig.content') }\n</match>`,
        preTargetType,
      })
    } else {
      setProperties(this, {
        pasteOrUpload: false,
        customContent: get(this, 'model.customTarget.config.content'),
      })
    }
  },

  kafkaWillSave() {
    const { model, intl } = this
    const errors = []
    let kt;
    const brokerEndpoints = get(model, 'kafka.config.brokerEndpoints');
    const zookeeperEndpoint = get(model, 'kafka.config.zookeeperEndpoint');
    const kafkaConfig = get(model, 'kafkaConfig') || {}

    if (brokerEndpoints && brokerEndpoints.length > 0) {
      kt = 'broker';
    } else if (zookeeperEndpoint) {
      kt = 'zookeeper';
    } else {
      errors.pushObject(intl.t('loggingPage.kafka.endpoint.required'))
    }

    if (kt === 'broker') {
      if (get(kafkaConfig, 'saslUsername') && get(kafkaConfig, 'saslPassword')) {
        if ( get(kafkaConfig, 'saslType') === 'plain' ) {
          set(kafkaConfig, 'saslScramMechanism', null)
        }
      } else {
        setProperties(kafkaConfig, {
          saslType:           null,
          saslScramMechanism: null,
        })
      }

      setProperties(kafkaConfig, {
        zookeeperEndpoint:  null,
        brokerEndpoints,
      });
    } else if (kt === 'zookeeper') {
      setProperties(kafkaConfig, {
        zookeeperEndpoint,
        brokerEndpoints:    null,
        saslScramMechanism: null,
        saslPassword:       null,
        saslType:           null,
        saslUsername:       null,
        clientKey:          null,
        clientCert:         null,
        certificate:        null,
      });
    }

    if (!get(kafkaConfig, 'topic')) {
      errors.pushObject(intl.t('loggingPage.kafka.topic.required'))
    }

    return errors
  },

  syslogWillSave() {
    const { model = {}, intl } = this
    const errors = []
    const config = get(model, 'syslog.config') || {}
    const {
      endpoint, protocol, enableTls, sslVerify
    } = config
    const syslogConfig = get(model, 'syslogConfig') || {}

    if (!endpoint) {
      errors.pushObject(intl.t('loggingPage.syslog.endpoint.required'))
    }

    if (protocol === 'udp') {
      setProperties(syslogConfig, {
        certificate:   null,
        clientKey:     null,
        clientCert:    null,
        sslVerify:     false,
        enableTls:     null,
      })
    }

    if (protocol === 'tcp') {
      if (!enableTls) {
        setProperties(syslogConfig, {
          certificate:   null,
          clientKey:     null,
          clientCert:    null,
          sslVerify:     false,
        })
      } else {
        if (!sslVerify) {
          set(syslogConfig, 'certificate', null)
        }
      }
    }

    return errors
  },

  splunkWillSave() {
    const { model = {}, intl } = this
    const errors = []

    if (!get(model, 'splunk.config.endpoint')) {
      errors.pushObject(intl.t('loggingPage.splunk.endpointRequired'))
    }
    if (!get(model, 'splunk.config.token')) {
      errors.pushObject(intl.t('loggingPage.splunk.tokenRequired'))
    }

    const config = get(model, 'splunk.config') || {}
    const { endpoint = '', sslVerify } = config
    const splunkConfig = get(model, 'splunkConfig') || {}

    if (endpoint.startsWith('https')) {
      if (!sslVerify) {
        set(splunkConfig, 'certificate', null)
      }
    } else {
      setProperties(splunkConfig, {
        certificate:   null,
        clientKey:     null,
        clientCert:    null,
        clientKeyPass: null,
        sslVerify:     false,
      })
    }

    return errors
  },

  elasticsearchWillSave() {
    const { model = {}, intl } = this
    const errors = []
    const config = get(model, 'elasticsearch.config') || {}

    const elasticsearchConfig = get(model, 'elasticsearchConfig') || {}

    set(elasticsearchConfig, 'indexPrefix', get(elasticsearchConfig, 'indexPrefix').toLowerCase());
    const indexPrefix = get(elasticsearchConfig, 'indexPrefix');

    if ( !indexPrefix ) {
      errors.pushObject(intl.t('loggingPage.elasticsearch.indexPatterns.errors.required'))
    }

    if ( indexPrefix.startsWith('-') || indexPrefix.startsWith('_') || indexPrefix.startsWith('+') ) {
      errors.pushObject(intl.t('loggingPage.elasticsearch.indexPatterns.errors.startsWith'))
    }

    INVALID_PREFIX_CHAR.forEach((char) => {
      if ( indexPrefix.indexOf(char) > -1 ) {
        errors.pushObject(intl.t('loggingPage.elasticsearch.indexPatterns.errors.invalidCharacters', { char }))
      }
    })

    const esErrors = get(this, 'esErrors')
    const { endpoint, sslVerify } = config

    if (!endpoint) {
      errors.pushObject(intl.t('loggingPage.elasticsearch.endpoint.required'))
    } else if (esErrors) {
      errors.pushObject(intl.t(esErrors))
    }

    set(elasticsearchConfig, 'endpoint', this.formatUrl(endpoint))

    if (endpoint.startsWith('https')) {
      if (!sslVerify) {
        set(elasticsearchConfig, 'certificate', null)
      }
    } else {
      setProperties(elasticsearchConfig, {
        certificate:   null,
        clientKey:     null,
        clientCert:    null,
        clientKeyPass: null,
        sslVerify:     false,
      })
    }

    return errors
  },

  fileToFormType(type) {
    let formType = type

    switch (type) {
    case 'splunk_hec':
      formType = 'splunk'
      break;
    case 'remote_syslog':
      formType = 'syslog'
      break;
    case 'kafka_buffered':
      formType = 'kafka'
      break;
    case 'forward':
      formType = 'fluentForwarder'
      break;
    }

    return formType
  },
});
