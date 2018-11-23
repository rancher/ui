import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';
import parseUri from 'shared/utils/parse-uri';

const INVALID_PREFIX_CHAR = ['\\', '/', '*', '?', '"', '<', '>', '|', ` `, ',', '#'];

export default Component.extend(NewOrEdit, {
  scope:            service(),
  globalStore:      service(),
  intl:             service(),
  // input
  errors:            null,
  targetType:        null,
  configMap:         null,
  endpointValidate:  true,

  pageScope:         reads('scope.currentPageScope'),
  cluster:           reads('scope.currentCluster'),
  project:           reads('scope.currentProject'),
  clusterTargetType: reads('clusterLogging.targetType'),

  actions: {
    save(cb) {
      let targetType = get(this, 'targetType');
      const pageScope = this.get('pageScope');
      const model = get(this, 'model');

      // set projectId or clusterId
      if (pageScope === 'project') {
        set(model, 'projectId', get(this, 'project.id'));
      }
      if (pageScope === 'cluster') {
        set(model, 'clusterId', get(this, 'cluster.id'));
      }

      model.setProperties({
        elasticsearchConfig:    null,
        splunkConfig:           null,
        kafkaConfig:            null,
        syslogConfig:           null,
        fluentForwarderConfig:  null,
      });

      if (targetType === 'none') {
        this._super(cb);

        return;
      }

      set(this, 'errors', [])
      const errors = get(this, 'errors') || []

      if (targetType === 'fluentForwarder') {
        if (!get(this, 'endpointValidate')) {
          errors.pushObject(`"Endpoint" is invalid`)
        }

        const fluentServers = get(model, 'fluentForwarder.config.fluentServers') || [];
        let filter = fluentServers.filter((f) => !f.endpoint)

        if (filter.length > 0) {
          errors.pushObject(`"Endpoint" is required`)
        }

        filter = fluentServers.filter((f) => !f.standby)
        if (filter.length === 0) {
          errors.pushObject(`Required at least one Non-Standby endpoint.`)
        }

        if (errors.length > 0) {
          set(this, 'errors', errors);
          cb();

          return;
        } else {
          const enableTls = get(model, 'fluentForwarder.config.enableTls')

          if (!enableTls) {
            set(model, 'fluentForwarder.config.certificate', null)
          }
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
          set(this, 'errors', ['"Endpoint" is required']);
          cb();

          return;
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
      }
      set(model, 'outputFlushInterval', get(model, `${ targetType }.outputFlushInterval`));
      set(model, 'outputTags', get(model, `${ targetType }.outputTags`));
      set(model, 'dockerRoot', get(model, `${ targetType }.dockerRoot`));

      let formatConfig = get(model, `${ targetType }.config`)

      set(model, `${ targetType }Config`, formatConfig);

      if (targetType === 'elasticsearch') {
        let elasticsearchConfig = get(model, 'elasticsearchConfig')

        set(elasticsearchConfig, 'indexPrefix', get(elasticsearchConfig, 'indexPrefix').toLowerCase());
        const indexPrefix = get(elasticsearchConfig, 'indexPrefix');

        if ( !indexPrefix ) {
          set(this, 'errors', [get(this, 'intl').t('loggingPage.elasticsearch.indexPatterns.errors.required')]);
          cb();

          return;
        }

        if ( indexPrefix.startsWith('-') || indexPrefix.startsWith('_') || indexPrefix.startsWith('+') ) {
          set(this, 'errors', [get(this, 'intl').t('loggingPage.elasticsearch.indexPatterns.errors.startsWith')]);
          cb();

          return;
        }

        INVALID_PREFIX_CHAR.forEach((char) => {
          if ( indexPrefix.indexOf(char) > -1 ) {
            set(this, 'errors', [get(this, 'intl').t('loggingPage.elasticsearch.indexPatterns.errors.invalidCharacters', { char })]);
          }
        })

        if ( get(this, 'errors.length') ) {
          cb();

          return;
        }

        set(elasticsearchConfig, 'endpoint', this.formatUrl(formatConfig.endpoint))
      }
      this._super(cb);
    },
  },

  headerLabel: function() {
    const ps = get(this, 'pageScope');

    if (ps === 'cluster') {
      return 'loggingPage.clusterHeader';
    } else {
      return 'loggingPage.projectHeader';
    }
  }.property('pageScope'),

  isClusterLevel: function() {
    return get(this, 'pageScope') === 'cluster';
  }.property('pageScope'),

  saveDisabled: function() {
    return get(this, 'originalModel.targetType') === 'none'
      && get(this, 'targetType') === 'none';
  }.property('originalModel.{id,targetType}', 'targetType'),

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
