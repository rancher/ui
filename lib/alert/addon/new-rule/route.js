import Route from '@ember/routing/route';
import { hash } from 'rsvp';
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
    const groupId = params.group_id;
    const id = params.id;

    if ( pageScope === 'cluster' ) {
      const clusterId = transition.params['authenticated.cluster'].cluster_id;

      return this.loadClusterResource(clusterId, id, groupId);
    } else {
      const projectId = transition.params['authenticated.project'].project_id;
      const clusterId = projectId.split(':');

      return this.loadProjectResource({
        projectId,
        clusterId,
        id: get(params, 'id'),
        groupId,
      });
    }
  },

  resetController(controller, isExiting/* , transition*/) {
    if ( isExiting ) {
      set(controller, 'id', null);
    }
  },

  getNewClusterAlert(clusterId, groupId) {
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
      groupId,
      clusterId,
      nodeRule,
      eventRule,
      systemServiceRule,
      metricRule,
      severity:    'critical',
    };
    const newAlert = gs.createRecord(opt);

    return newAlert;
  },

  loadClusterResource(clusterId, id, groupId) {
    const globalStore = get(this, 'globalStore');
    let newAlert;

    if ( id ) {
      newAlert = globalStore.find('clusterAlertRule', id)
        .then( ( alert ) => {
          const cloned =  alert.cloneForNew() ;
          const t = get(cloned, 'targetType');

          if ( t === 'event' ) {
            const et = get(cloned, 'eventRule.eventType');

            if ( et === 'Normal' ) {
              set(cloned, '_targetType', 'normalEvent');
            }
            if ( et === 'Warning' ) {
              set(cloned, '_targetType', 'warningEvent');
            }
          } else {
            set(cloned, '_targetType', t);
          }

          return cloned;
        });
    } else {
      newAlert = this.getNewClusterAlert(clusterId, groupId);
    }

    const opt = { filter: { clusterId } };

    return hash({
      nodes:      globalStore.findAll('node', opt),
      notifiers:  globalStore.findAll('notifier', opt),
      alertRule:  newAlert,
      alertGroup: globalStore.find('clusterAlertGroup', groupId),
    }).then((hash) => {
      return {
        nodes:      hash.nodes,
        notifiers:  hash.notifiers,
        alertRule:  hash.alertRule,
        alertGroup: hash.alertGroup,
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

    return newAlert;
  },

  loadProjectResource({
    clusterId, projectId, id, groupId
  }) {
    const store = get(this, 'store');
    const globalStore = get(this, 'globalStore');

    let newAlert;

    if ( id ) {
      newAlert = globalStore.find('projectAlertRule', id)
        .then( ( alert ) => {
          const cloned = alert.cloneForNew() ;
          const t = get(cloned, 'targetType');

          set(cloned, '_targetType', t);

          if ( t === 'pod' ) {
            set(cloned, 'workloadRule',  globalStore.createRecord({ type: 'workloadRule' }) );
          }
          if ( t === 'workload' || t === 'workloadSelector' ) {
            set(cloned, 'podRule', globalStore.createRecord({ type: 'podRule' }));
          }

          return cloned;
        });
    } else {
      newAlert = this.getNewProjectAlert(projectId);
    }

    const opt = { filter: { projectId } };

    return hash({
      pods:       store.findAll('pod', opt),
      workloads:  store.findAll('workload', opt),
      notifiers:  globalStore.findAll('notifier', { filter: { clusterId } }),
      alertRule:  newAlert,
      alertGroup: globalStore.find('projectAlertGroup', groupId),
    }).then(({
      pods, workloads, notifiers, alertRule, alertGroup
    }) => {
      return {
        pods,
        workloads,
        notifiers,
        alertRule,
        alertGroup,
      }
    });
  },

});
