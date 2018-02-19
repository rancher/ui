import Ember from 'ember';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';

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

  delete(model, cb) {
    const pageScope = this.get('pageScope');
    const loggingType = pageScope === 'cluster' ? 'clusterlogging' : 'projectlogging';
    const nue = get(this, 'globalStore').createRecord({type: loggingType});
    model.delete().then(() => {
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

      const ok = this.validate();

      if (!ok) {
        cb();
        return;
      }

      this._super(cb);
      // model.save().then(nue => {
      //   this.setProperties({
      //     model: nue,
      //     originalModel: nue.clone(),
      //   });
      //   cb(true);
      // }).catch(err => {
      //   console.log(err);
      //   cb();
      // });
    },
  },
});
