import Ember from 'ember';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';

export default Ember.Component.extend({
  scope: service(),
  globalStore: service(),
  pageScope: alias('scope.currentPageScope'),
  cluster: alias('scope.currentCluster'),
  project: alias('scope.currentProject'),

  intl: service(),
  // input
  errors: null,
  targetType: null,
  clusterTargetType: null,
  configMap: null,

  init() {
    this._super(...arguments);
    const pageScope = get(this, 'pageScope');
    const store = this.get('globalStore');
    if (pageScope === 'project') {
      store.findAll('clusterlogging').then(collection => {
        const cl = collection.get('firstObject');
        if (cl) {
          this.set('clusterTargetType', cl.get('targetType'));
        }
      });
    }
  },

  isClusterLevel: function() {
    return get(this, 'pageScope') === 'cluster';
  }.property('pageScope'),

  willSave() {
    const errors = get(this, 'model').validationErrors();
    if (errors.get('length')) {
      set(this, 'errors', errors);
      return false;
    }
    set(this, 'errors', null);
    return true;
  },

  delete(model, cb) {
    const pageScope = this.get('pageScope');
    const loggingType = pageScope === 'cluster' ? 'clusterlogging' : 'projectlogging';
    const nue = get(this, 'globalStore').createRecord({type: loggingType});
    model.delete().then(res => {
      set(this, 'model', nue)
      set(this, 'originalModel', nue.clone);
      cb(true);
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
        const kt = get(model, 'kafka.config.brokerType');
        if (kt === 'broker') {
          set(model, 'kafkaConfig', {
            zookeeperEndpoint: null,
            brokerEndpoints: get(model, 'kafka.config.brokerEndpoints'),
          });
        } else if (kt === 'zookeeper') {
          set(model, 'kafkaConfig', {
            zookeeperEndpoint: get(model, 'kafka.config.zookeeperEndpoint'),
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

      const ok = this.willSave();
      if (!ok) {
        return;
      }

      model.save().then(nue => {
        this.setProperties({
          model: nue,
          originalModel: nue.clone(),
        });
        cb(true);
      }).catch(err => {
        console.log(err);
      });
    },
  },
});
