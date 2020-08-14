import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed'
import EditOrClone from 'alert/mixins/edit-or-clone';

export default Route.extend(EditOrClone, {
  globalStore: service(),
  scope:       service(),
  growl:       service(),

  pageScope:   reads('scope.currentPageScope'),

  model(params/* , transition */) {
    const pageScope = get(this, 'pageScope');
    const groupId = params.group_id;
    const id = params.id;

    if ( pageScope === 'cluster' ) {
      const clusterId = get(this.scope, 'currentCluster.id');

      return this.loadClusterResource(clusterId, id, groupId);
    } else {
      const projectId = get(this.scope, 'currentProject.id');
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
    const clusterScanRule = gs.createRecord({
      type:        'clusterScanRule',
      scanRunType: 'manual'
    });

    const opt = {
      type:        'clusterAlertRule',
      groupId,
      clusterId,
      nodeRule,
      eventRule,
      systemServiceRule,
      clusterScanRule,
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

          return this.loadClusterRule(cloned);
        });
    } else {
      newAlert = this.getNewClusterAlert(clusterId, groupId);
    }

    const opt = { filter: { clusterId } };

    return hash({
      nodes:      globalStore.find('node', null, opt),
      notifiers:  globalStore.find('notifier', null, opt),
      alertRule:  newAlert,
      alertGroup: globalStore.find('clusterAlertGroup', groupId),
    }).then((hash) => {
      return {
        nodes:      hash.nodes,
        notifiers:  hash.notifiers,
        alertRule:  hash.alertRule,
        alertGroup: hash.alertGroup,
        mode:       'new',
        level:      'rule',
      }
    });
  },

  getNewProjectAlert(projectId, groupId) {
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
      groupId,
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

          return this.loadProjectRule(cloned);
        });
    } else {
      newAlert = this.getNewProjectAlert(projectId);
    }

    const opt = { filter: { projectId } };

    return hash({
      pods:       store.find('pod', null, opt),
      workloads:  store.find('workload', null, opt),
      notifiers:  globalStore.find('notifier', null, { filter: { clusterId } }),
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
        mode:  'new',
        level: 'rule',
      }
    });
  },

});
