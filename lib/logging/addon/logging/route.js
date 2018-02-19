import Route from '@ember/routing/route';
import { next } from '@ember/runloop';
import { inject as service } from "@ember/service";
import { get, set } from '@ember/object'
import { alias } from '@ember/object/computed';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  scope: service(),
  pageScope: alias('scope.currentPageScope'),
  cluster: alias('scope.currentCluster'),
  project: alias('scope.currentProject'),

  createLogging(loggingType) {
    const newLogging = get(this, 'globalStore').createRecord({
      type: loggingType,
      outputFlushInterval: 3,
      outputTags: {},
    });
    return newLogging;
  },

  model(params, transition) {
    const globalStore = this.get('globalStore');
    const pageScope = this.get('pageScope');
    const cluster = window.l('route:application').modelFor('authenticated.cluster');
    if (pageScope === 'cluster') {
      const cluster = window.l('route:application').modelFor('authenticated.cluster');
      const opt = {
        filter: {
          clusterId: cluster.get('id'),
        },
      };
      return globalStore.findAll('clusterlogging', opt).then(loggings => {
        let logging = loggings.get('firstObject');
        if (!logging) {
          logging = this.createLogging('clusterlogging');
        }
        const originalLogging = logging.clone();
        return {
          logging,
          originalLogging,
        };
      });
    } else if (pageScope === 'project') {
      const project = window.l('route:application').modelFor('authenticated.project').get('project');
      const [clusterId] = project.get('id').split(':');
      const clusterOpt = {
        filter: {
          clusterId,
        },
      };
      const projectOpt = {
        filter: {
          projectId: project.get('id'),
        },
      };
      return hash({
        clusterLogging: globalStore.findAll('clusterlogging', clusterOpt),
        projectLogging: globalStore.findAll('projectlogging', projectOpt),
      }).then(hash => {
        let logging = hash.projectLogging.get('firstObject');
        if (!logging) {
          logging = this.createLogging('projectlogging');
        }
        const originalLogging = logging.clone();
        const clusterLogging = hash.clusterLogging.get('firstObject');
        return {
          logging,
          originalLogging,
          clusterLogging,
        };
      });
    }
  },
  setupController(controller, model) {
    this._super(...arguments);
    const t = get(model, 'originalLogging.targetType');
    next(() => {
      controller.set('targetType', t);
    });
  },
});
