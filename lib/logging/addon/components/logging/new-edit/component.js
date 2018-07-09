import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';
import parseUri from 'shared/utils/parse-uri';

export default Component.extend(NewOrEdit, {
  scope:       service(),
  globalStore: service(),
  intl:        service(),
  // input
  errors:            null,
  targetType:        null,
  configMap:         null,
  pageScope:   reads('scope.currentPageScope'),
  cluster:     reads('scope.currentCluster'),
  project:     reads('scope.currentProject'),

  clusterTargetType: reads('clusterLogging.targetType'),

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

  actions: {
    save(cb) {

      const targetType = get(this, 'targetType');
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
        elasticsearchConfig: null,
        splunkConfig:        null,
        embeddedConfig:      null,
        kafkaConfig:         null,
        syslogConfig:        null,
      });

      if (targetType === 'none') {

        this._super(cb);

        return;

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

        set(elasticsearchConfig, `endpoint`, this.formatUrl(formatConfig.endpoint))

      }
      this._super(cb);

    },
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
