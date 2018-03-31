import Ember from 'ember';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { resolve } from 'rsvp';

export default Ember.Component.extend(NewOrEdit, {
  scope: service(),
  globalStore: service(),
  pageScope: reads('scope.currentPageScope'),
  cluster: reads('scope.currentCluster'),
  project: reads('scope.currentProject'),

  intl: service(),
  // input
  errors: null,
  targetType: null,
  configMap: null,
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

  pollLogging() {
    const tt = get(this, 'targetType');
    const esDeployState = get(this, 'originalModel.embeddedConfig.elasticsearchEndpoint');
    const kibanaDeployState = get(this, 'originalModel.embeddedConfig.kibanaEndpoint');
    const loggingType = get(this, 'originalModel.type');
    const id = get(this, 'originalModel.id');
    if (
      tt === 'embedded' &&
        (
          (!esDeployState || esDeployState === 'Pending') ||
          (!kibanaDeployState || kibanaDeployState === 'Pending')
        )
    ) {
      const gs = get(this, 'globalStore');
      return gs.find(loggingType, id, {forceReload: true}).then(nue => {
        set(this, 'originalModel.embeddedConfig.elasticsearchEndpoint', nue.get('embeddedConfig.elasticsearchEndpoint'));
        set(this, 'originalModel.embeddedConfig.kibanaEndpoint', nue.get('embeddedConfig.kibanaEndpoint'));
        setTimeout(() => {
          this.pollLogging();
        }, 2000);
      });
    }
    return resolve();
  },

  esDeployState: function() {
    const state = get(this, 'originalModel.embeddedConfig.elasticsearchEndpoint');
    const intl = get(this, 'intl');
    if (state === 'Failed') {
      return {
        background: 'bg-error',
        icon: 'icon icon-x  text-error',
        message: intl.t('loggingPage.embedded.esDeployState.message.failed'),
        state: 'failed',
      };
    } else if (!state || state === 'Pending') {
      return {
        background: 'bg-primary',
        icon: 'icon icon-spinner icon-spin',
        message: intl.t('loggingPage.embedded.esDeployState.message.pending'),
        state: 'pending',
      };
    } else {
      return {
        background: 'bg-success',
        icon: 'icon icon-check text-success',
        message: intl.t('loggingPage.embedded.esDeployState.message.success'),
        state: 'success',
      };
    }
  }.property('originalModel.embeddedConfig.elasticsearchEndpoint'),

  kibanaDeployState: function() {
    const state = get(this, 'originalModel.embeddedConfig.kibanaEndpoint');
    const intl = get(this, 'intl');
    if (state === 'Failed') {
      return {
        background: 'bg-error',
        icon: 'icon icon-x  text-error',
        message: intl.t('loggingPage.embedded.kibanaDeployState.message.failed'),
        state: 'failed',
      };
    }else if (!state || state === 'Pending') {
      return {
        background: 'bg-primary',
        icon: 'icon icon-spinner icon-spin',
        message: intl.t('loggingPage.embedded.kibanaDeployState.message.pending'),
        state: 'pending',
      };
    } else {
      return {
        background: 'bg-success',
        icon: 'icon icon-check text-success',
        message: intl.t('loggingPage.embedded.kibanaDeployState.message.success'),
        state: 'success',
      };
    }
  }.property('originalModel.embeddedConfig.kibanaEndpoint'),

  delete(model, cb) {
    const loggingType = model.get('type');
    const nue = get(this, 'globalStore').createRecord({type: loggingType});
    model.delete().then(() => {
      set(this, 'model', nue.clone().patch());
      set(this, 'originalModel', nue.clone());
      cb(true);
    }).catch(error => {
      set('errors', [error]);
      cb();
    });
  },

  saveDisabled: function() {
    return get(this, 'originalModel.targetType') === 'none'
      && get(this, 'targetType') === 'none';
  }.property('originalModel.{id,targetType}', 'targetType'),

  actions: {
    save(cb) {
      const targetType = get(this, 'targetType');
      const pageScope = this.get('pageScope');
      const model = get(this, 'model');

      if (targetType === 'none') {
        this.delete(model, cb);
        return;
      }

      // set projectId or clusterId
      if (pageScope === 'project') {
        set(model, 'projectId', get(this, 'project.id'));
      }
      if (pageScope === 'cluster') {
        set(model, 'clusterId', get(this, 'cluster.id'));
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

      model.setProperties({
        elasticsearchConfig: null,
        splunkConfig: null,
        embeddedConfig: null,
        kafkaConfig: null,
        syslogConfig: null,
      });

      set(model, 'outputFlushInterval', get(model, `${targetType}.outputFlushInterval`));
      set(model, 'outputTags', get(model, `${targetType}.outputTags`));
      set(model, `${targetType}Config`, get(model, `${targetType}.config`));
      this._super(cb);
    },
  },

  doneSaving(nue) {
    set(this, 'model', nue.patch());
    return this.pollLogging();
  },
});
