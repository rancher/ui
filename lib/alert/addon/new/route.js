import Route from '@ember/routing/route';
import { hash, resolve } from 'rsvp';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed'

export default Route.extend({
  globalStore: service(),
  scope:       service(),
  pageScope:   reads('scope.currentPageScope'),

  model(params, transition) {
    const pageScope = get(this, 'pageScope');

    if ( pageScope === 'cluster' ) {
      const clusterId = transition.params['authenticated.cluster'].cluster_id;

      return this.loadClusterResource(clusterId, get(params, 'id'));
    } else {
      const projectId = transition.params['authenticated.project'].project_id;
      const clusterId = projectId.split(':');

      return this.loadProjectResource({
        projectId,
        clusterId,
        id: get(params, 'id')
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

    const targetNode = gs.createRecord({ type: 'targetNode' });
    const targetSystemService = gs.createRecord({ type: 'targetSystemService' });
    const targetEvent = gs.createRecord({ type: 'targetEvent' });

    const recipients = [
      gs.createRecord({ type: 'recipient' }),
    ];

    const opt = {
      type: 'clusterAlert',
      clusterId,

      targetNode,
      targetEvent,
      targetSystemService,
      recipients,
    };
    const newAlert = gs.createRecord(opt);

    return resolve(newAlert);
  },

  loadClusterResource(clusterId, id) {
    const globalStore = get(this, 'globalStore');
    let newAlert;

    if ( id ) {
      newAlert = globalStore.find('clusterAlert', id)
        .then( ( alert ) => {
          const cloned =  alert.cloneForNew() ;
          const t = get(cloned, 'targetType');

          if ( t === 'event' ) {
            const et = get(cloned, 'targetEvent.eventType');

            if ( et === 'Normal' ) {
              set(cloned, '_targetType', 'normalEvent');
            }
            if ( et === 'Warning' ) {
              set(cloned, '_targetType', 'warningEvent');
            }
          } else {
            set(cloned, '_targetType', t);
          }

          if ( !get(cloned, 'recipients') ) {
            set(cloned, 'recipients', [
              globalStore.createRecord({ type: 'recipient' }),
            ]);
          }

          return cloned;
        });
    } else {
      newAlert = this.getNewClusterAlert(clusterId);
    }

    const opt = { filter: { clusterId } };

    return hash({
      nodes:     globalStore.findAll('node', opt),
      notifiers: globalStore.findAll('notifier', opt),
      newAlert,
    });
  },

  getNewProjectAlert(projectId) {
    const gs = get(this, 'globalStore');

    const targetPod = gs.createRecord({ type: 'targetPod' });
    const targetWorkload = gs.createRecord({ type: 'targetWorkload' });
    const recipients = [
      gs.createRecord({ type: 'recipient' }),
    ];

    const opt = {
      type:                  'projectAlert',
      projectId,
      displayName:           null,
      initialWaitSeconds:    180,
      repeatIntervalSeconds: 3600,
      targetName:            null,

      targetPod,
      targetWorkload,
      recipients,
    };

    const newAlert = gs.createRecord(opt);

    return resolve(newAlert);
  },

  loadProjectResource({
    clusterId, projectId, id
  }) {
    const store = get(this, 'store');
    const globalStore = get(this, 'globalStore');

    let newAlert;

    if ( id ) {
      newAlert = globalStore.find('projectAlert', id)
        .then( ( alert ) => {
          const cloned = alert.cloneForNew() ;
          const t = get(cloned, 'targetType');

          set(cloned, '_targetType', t);
          if ( !get(cloned, 'recipients') ) {
            set(cloned, 'recipients', [
              globalStore.createRecord({ type: 'recipient' }),
            ]);
          }

          if ( t === 'pod' ) {
            set(cloned, 'targetWorkload',  globalStore.createRecord({ type: 'targetWorkload' }) );
          }
          if ( t === 'workload' || t === 'workloadSelector' ) {
            set(cloned, 'targetPod', globalStore.createRecord({ type: 'targetPod' }));
          }

          return cloned;
        });
    } else {
      newAlert = this.getNewProjectAlert(projectId);
    }

    const opt = { filter: { projectId } };

    return hash({
      pods:      store.findAll('pod', opt),
      workloads: store.findAll('workload', opt),
      notifiers: globalStore.findAll('notifier', { filter: { clusterId } }),
      newAlert,
    });
  },

});
