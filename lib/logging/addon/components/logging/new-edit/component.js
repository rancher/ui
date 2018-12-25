import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  get, set, observer, setProperties, computed
} from '@ember/object';
import { reads } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';
import parseUri from 'shared/utils/parse-uri';
import { resolve } from 'rsvp';

const INVALID_PREFIX_CHAR = ['\\', '/', '*', '?', '"', '<', '>', '|', ` `, ',', '#'];

export default Component.extend(NewOrEdit, {
  scope:                   service(),
  globalStore:             service(),
  intl:                    service(),
  // input
  errors:                  null,
  targetType:              null,
  configMap:               null,
  esEndpointValidate:      true,
  fluentdEndpointValidate:  true,
  esErrors:                [],

  testing:           false,
  testOk:            true,
  tested:      false,

  pageScope:         reads('scope.currentPageScope'),
  cluster:           reads('scope.currentCluster'),
  project:           reads('scope.currentProject'),
  clusterTargetType: reads('clusterLogging.targetType'),

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

      return gs.rawRequest({
        url:    `${ pageScope }loggings?action=test`,
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
          errors:  [xhr.body.message || xhr.body.code],
        });
      }).finally(() => {
        setProperties(this, {
          tested:  true,
          testing: false,
          model:   clone,
        })
        setTimeout(() => {
          set(this, 'tested', false);
        }, 3000);
      });
    },
  },

  targetTypeChange: observer('targetType', function() {
    set(this, 'errors', [])
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

  saveDisabled: computed('originalModel.{id,targetType}', 'targetType', function() {
    return get(this, 'originalModel.targetType') === 'none'
      && get(this, 'targetType') === 'none';
  }),

  willSave() {
    let targetType = get(this, 'targetType');
    const pageScope = this.get('pageScope');
    const model = get(this, 'model');
    const intl = get(this, 'intl')

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
    });

    if (targetType === 'none') {
      return false;
    }

    set(this, 'errors', [])
    const errors = get(this, 'errors') || []

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
        const enableTls = get(model, 'fluentForwarder.config.enableTls')

        if (!enableTls) {
          set(model, 'fluentForwarder.config.certificate', null)
        }
      }
    }

    if (targetType === 'splunk') {
      if (!get(model, 'splunk.config.endpoint')) {
        errors.pushObject(intl.t('loggingPage.splunk.endpointRequired'))
      }
      if (!get(model, 'splunk.config.token')) {
        errors.pushObject(intl.t('loggingPage.splunk.tokenRequired'))
      }
    }

    if (targetType === 'syslog') {
      if (!get(model, 'syslog.config.endpoint')) {
        errors.pushObject(intl.t('loggingPage.syslog.endpoint.required'))
      }
    }

    // set kafka config
    if (targetType === 'kafka') {
      let kt;
      const brokerEndpoints = get(model, 'kafka.config.brokerEndpoints');
      const zookeeperEndpoint = get(model, 'kafka.config.zookeeperEndpoint');

      if (brokerEndpoints && brokerEndpoints.length > 0) {
        kt = 'broker';
      } else if (zookeeperEndpoint) {
        kt = 'zookeeper';
      } else {
        errors.pushObject(intl.t('loggingPage.kafka.endpoint.required'))
      }
      if (kt === 'broker') {
        set(model, 'kafkaConfig', {
          zookeeperEndpoint: null,
          brokerEndpoints,
        });
      } else if (kt === 'zookeeper') {
        set(model, 'kafkaConfig', {
          zookeeperEndpoint,
          brokerEndpoints: null,
        });
      }

      if (!get(model, 'kafka.config.topic')) {
        errors.pushObject(intl.t('loggingPage.kafka.topic.required'))
      }
    }

    let formatConfig = get(model, `${ targetType }.config`)

    setProperties(model, {
      outputFlushInterval:       get(model, `${ targetType }.outputFlushInterval`),
      outputTags:                get(model, `${ targetType }.outputTags`),
      dockerRoot:                get(model, `${ targetType }.dockerRoot`),
      [`${ targetType }Config`]: formatConfig,
      excludeSystemComponent:    get(model, `${ targetType }.excludeSystemComponent`),
    })

    if (targetType === 'elasticsearch') {
      let elasticsearchConfig = get(model, 'elasticsearchConfig')

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

      if (!formatConfig.endpoint) {
        errors.pushObject(intl.t('loggingPage.elasticsearch.endpoint.required'))
      } else if (esErrors) {
        errors.pushObject(intl.t(esErrors))
      }

      set(elasticsearchConfig, 'endpoint', this.formatUrl(formatConfig.endpoint))
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

  doneSaving() {
    this.sendAction('refreshModel');
  },

});
