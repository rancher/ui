import Route from '@ember/routing/route';
import { hash, resolve } from 'rsvp';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed'

export default Route.extend({
  globalStore: service(),
  scope:       service(),
  growl:       service(),

  pageScope:   reads('scope.currentPageScope'),

  model(params, transition) {
    const pageScope = get(this, 'pageScope');

    if ( pageScope === 'cluster' ) {
      const clusterId = transition.params['authenticated.cluster'].cluster_id;

      return this.loadClusterResource(clusterId);
    } else {
      const projectId = transition.params['authenticated.project'].project_id;
      const clusterId = projectId.split(':');

      return this.loadProjectResource({
        projectId,
        clusterId,
      });
    }
  },

  resetController(controller, isExiting/* , transition*/) {
    if ( isExiting ) {
      set(controller, 'id', null);
    }
  },

  getNewClusterAlert(clusterId) {
    const gs = get(this, 'globalStore');

    const nodeRule = gs.createRecord({ type: 'nodeRule' });
    const systemServiceRule = gs.createRecord({ type: 'systemServiceRule' });
    const eventRule = gs.createRecord({ type: 'eventRule' });
    const metricRule = gs.createRecord({
      type:           'metricRule',
      comparison:     'greater-than',
      duration:       '5m',
      thresholdValue: 0,
    })

    const opt = {
      type:        'clusterAlertRule',
      clusterId,
      nodeRule,
      eventRule,
      systemServiceRule,
      metricRule,
      severity:    'critical',
    };
    const newAlert = gs.createRecord(opt);

    return resolve([newAlert]);
  },

  loadClusterResource(clusterId) {
    const globalStore = get(this, 'globalStore');

    const opt = { filter: { clusterId } };

    return hash({
      nodes:      globalStore.findAll('node', opt),
      notifiers:  globalStore.findAll('notifier', opt),
      alertRules: this.getNewClusterAlert(),
      alertGroup: globalStore.createRecord({ type: 'clusterAlertGroup' }),
    }).then((hash) => {
      return {
        nodes:      hash.nodes,
        notifiers:  hash.notifiers,
        alertRules: hash.alertRules,
        alertGroup: hash.alertGroup,
        mode:       'new',
        level:      'group',
      }
    });
  },

  getNewProjectAlert(projectId) {
    const gs = get(this, 'globalStore');

    const podRule = gs.createRecord({ type: 'podRule' });
    const workloadRule = gs.createRecord({ type: 'workloadRule' });
    const metricRule = gs.createRecord({
      type:           'metricRule',
      comparison:     'greater-than',
      duration:       '5m',
      thresholdValue: 0,
    })

    const opt = {
      type:                  'projectAlertRule',
      projectId,
      initialWaitSeconds:    180,
      repeatIntervalSeconds: 3600,
      targetName:            null,

      podRule,
      workloadRule,
      metricRule,
    };

    const newAlert = gs.createRecord(opt);

    return resolve([newAlert]);
  },

  loadProjectResource({ clusterId, projectId }) {
    const store = get(this, 'store');
    const globalStore = get(this, 'globalStore');

    const opt = { filter: { projectId } };

    return hash({
      pods:       store.findAll('pod', opt),
      workloads:  store.findAll('workload', opt),
      notifiers:  globalStore.findAll('notifier', { filter: { clusterId } }),
      alertRules: this.getNewProjectAlert(),
      alertGroup: globalStore.createRecord({ type: 'projectAlertGroup' }),
    }).then(({
      pods, workloads, notifiers, alertRules, alertGroup
    }) => {
      return {
        pods,
        workloads,
        notifiers,
        alertRules,
        alertGroup,
        mode:  'new',
        level: 'group',
      }
    });
  },

});
