import Route from '@ember/routing/route';
import { next } from '@ember/runloop';
import { inject as service } from "@ember/service";
import { get } from '@ember/object'
import { alias } from '@ember/object/computed';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  scope: service(),
  pageScope: alias('scope.currentPageScope'),
  cluster: alias('scope.currentCluster'),
  project: alias('scope.currentProject'),

  createLogging(loggingType) {
    const gs = get(this, 'globalStore');
    const newLogging = gs.createRecord({
      type: loggingType,
      outputFlushInterval: 3,
      outputTags: {},
    });
    return newLogging;
  },

  // patchLogging(logging) {
  //   const t = get(logging, 'targetType');
  //   const gs = get(this, 'globalStore');

  //   const nue = gs.createRecord({
  //     type: logging.get('type'),
  //   });

  //   const loggingTagets = [
  //     'embedded',
  //     'kafka',
  //     'elasticsearch',
  //     'splunk',
  //     'syslog',
  //   ];

  //   const map = {};
  //   loggingTagets.forEach(key => {
  //     const config = gs.createRecord({
  //       type: `${key}Config`
  //     });
  //     const clone = nue.clone();
  //     clone.set('config', config);
  //     map[key] = clone;
  //   });

  //   // why can't set props on logging ???????????????
  // logging.set('a', 1);
  // logging.get('a') // ===> undefined
  //   logging.setProperties(map);
  //   if (t && t !== 'none') {
  //     set(logging, `${t}.config`, get(logging, `${t}Config`));
  //     set(logging, `${t}.outputFlushInterval`, get(logging, 'outputFlushInterval'));
  //     set(logging, `${t}.outputTags`, get(logging, 'outputTags'));
  //   }
  //   console.log('------logging', logging);
  //   return logging;
  // },

  model(/*params, transition*/) {
    const globalStore = this.get('globalStore');
    const pageScope = this.get('pageScope');
    const cluster = window.l('route:application').modelFor('authenticated.cluster');
    if (pageScope === 'cluster') {
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
