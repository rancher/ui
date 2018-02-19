import Route from '@ember/routing/route';
import { hash, resolve } from 'rsvp';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed'

export default Route.extend({
  globalStore: service(),
  scope: service(),
  pageScope: reads('scope.currentPageScope'),

  getNewClusterAlert(clusterId) {
    const gs = get(this, 'globalStore');

    const targetNode = gs.createRecord({type: 'targetNode'});
    const targetSystemService = gs.createRecord({type: 'targetSystemService'});
    const targetEvent = gs.createRecord({type: 'targetEvent'});

    const recipients = [
      gs.createRecord({type: 'recipient'}),
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

  loadClusterResource(clusterId) {
    const store = get(this, 'store');
    const globalStore = get(this, 'globalStore');
    const newAlert = this.getNewClusterAlert(clusterId);

    const opt = {filter: {clusterId}};
    return hash({
      nodes: globalStore.findAll('node', opt),
      notifiers: globalStore.findAll('notifier'),
      newAlert,
    });
  },

  getNewProjectAlert(projectId) {
    const gs = get(this, 'globalStore');

    const targetPod = gs.createRecord({type: 'targetPod'});
    const targetWorkload = gs.createRecord({type: 'targetWorkload'});
    const recipients = [
      gs.createRecord({type: 'recipient'}),
    ];

    const opt = {
      type: 'projectAlert',
      projectId,
      displayName: null,
      initialWaitSeconds: 180,
      repeatIntervalSeconds: 3600,
      targetName: null,

      targetPod,
      targetWorkload,
      recipients,
    };

    const newAlert = gs.createRecord(opt);
    return resolve(newAlert);
  },

  loadProjectResource({clusterId, projectId}) {
    const store = get(this, 'store');
    const globalStore = get(this, 'globalStore');
    const newAlert = this.getNewProjectAlert(projectId);
    const opt = {filter: {projectId}};

    return hash({
      pods: store.find('pod', null),
      statefulsets: store.findAll('statefulset', opt),
      daemonsets: store.findAll('daemonset', opt),
      deployments: store.findAll('deployment', opt),
      notifiers: globalStore.findAll('notifier', {filter: {clusterId}}),
      newAlert,
    });
  },
  model(params, transition) {
    const pageScope = get(this, 'pageScope');

    if (pageScope === 'cluster') {
      const clusterId = transition.params['authenticated.cluster'].cluster_id;
      return this.loadClusterResource(clusterId);
    } else {
      const projectId = transition.params['authenticated.project'].project_id;
      const clusterId = projectId.split(':');
      return this.loadProjectResource({projectId, clusterId});
    }
  },
});
