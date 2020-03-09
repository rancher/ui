import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { get, setProperties, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed'

export default Route.extend({
  globalStore: service(),
  scope:       service(),
  growl:       service(),

  pageScope:   reads('scope.currentPageScope'),

  model(params) {
    const pageScope = get(this, 'pageScope');
    const groupId = params.alert_id;

    if (pageScope === 'cluster') {
      const cluster = window.l('route:application').modelFor('authenticated.cluster');
      const clusterId = cluster.get('id');

      return this.loadClusterResource({
        clusterId,
        groupId
      });
    } else {
      const project = window.l('route:application').modelFor('authenticated.project').get('project');
      const projectId = project.get('id');
      const clusterId = project.get('clusterId');

      return this.loadProjectResource({
        projectId,
        clusterId,
        groupId
      });
    }
  },
  isMonitoringEnabled() {
    const ps = get(this, 'pageScope');

    if (ps === 'cluster') {
      return get(this, 'scope.currentCluster.enableClusterMonitoring')
    } else {
      return get(this, 'scope.currentProject.enableProjectMonitoring')
    }
  },

  getNewClusterAlert(alert) {
    const gs = get(this, 'globalStore');

    const nodeRule = gs.createRecord({ type: 'nodeRule' });
    const systemServiceRule = gs.createRecord({ type: 'systemServiceRule' });
    const clusterScanRule = gs.createRecord({
      type:        'clusterScanRule',
      scanRunType: 'manual'
    });
    const eventRule = gs.createRecord({ type: 'eventRule' });
    const metricRule = gs.createRecord({
      type:           'metricRule',
      comparison:     'greater-than',
      duration:       '5m',
      thresholdValue: 0,
    })

    const t = get(alert, 'targetType');
    const et = get(alert, 'eventRule.eventType');

    set(alert, '_targetType', t);

    switch (t) {
    case 'event':
      switch (et) {
      case 'Normal':
        set(alert, '_targetType', 'normalEvent');
        break;
      case 'Warning':
        set(alert, '_targetType', 'warningEvent');
        break;
      }
      setProperties(alert, {
        nodeRule,
        systemServiceRule,
        metricRule,
        clusterScanRule,
      });
      break;
    case 'node':
    case 'nodeSelector':
      setProperties(alert, {
        eventRule,
        systemServiceRule,
        metricRule,
        clusterScanRule,
      });
      break;
    case 'systemService':
      setProperties(alert, {
        nodeRule,
        eventRule,
        metricRule,
        clusterScanRule,
      });
      break;
    case 'metric':
      setProperties(alert, {
        nodeRule,
        systemServiceRule,
        eventRule,
        clusterScanRule,
      })
      break;
    case 'cisScan':
      setProperties(alert, {
        nodeRule,
        systemServiceRule,
        eventRule,
        metricRule,
      })
      break;
    }

    return alert;
  },

  loadClusterResource({ clusterId, groupId }) {
    const globalStore = get(this, 'globalStore');
    const opt = { filter: { clusterId } };
    let metrics

    if (this.isMonitoringEnabled()) {
      metrics = globalStore.rawRequest({
        url:    `monitormetrics?action=listclustermetricname&limit=-1`,
        method: 'POST',
        data:   { clusterId, }
      }).catch((err = {}) => {
        get(this, 'growl').fromError(get(err, 'body.message'));
      });
    }

    return hash({
      nodes:      globalStore.find('node', null, opt),
      notifiers:  globalStore.findAll('notifier'),
      alertRules: globalStore.find('clusterAlertRule'),
      alertGroup: globalStore.find('clusterAlertGroup', groupId),
      metrics,
    }).then(({
      nodes, notifiers, alertRules, alertGroup, metrics
    }) => {
      return {
        nodes,
        notifiers,
        alertRules: alertRules.filter((g) => g.groupId === groupId).map((a) => {
          const alert = a.clone()

          return this.getNewClusterAlert(alert)
        }),
        alertGroup: alertGroup.clone(),
        metrics:    metrics && metrics.body && metrics.body.names,
        mode:       'edit',
        level:      'group',
      }
    });
  },

  getNewProjectAlert(alert) {
    const gs = get(this, 'globalStore');
    const podRule = gs.createRecord({ type: 'podRule' });
    const workloadRule = gs.createRecord({ type: 'workloadRule' });
    const metricRule = gs.createRecord({
      type:           'metricRule',
      comparison:     'greater-than',
      duration:       '5m',
      thresholdValue: 0,
    })

    const t = get(alert, 'targetType');

    set(alert, '_targetType', t);

    switch (t) {
    case 'pod':
      setProperties(alert, {
        metricRule,
        workloadRule,
      })
      break;
    case 'workload':
    case 'workloadSelector':
      setProperties(alert, {
        podRule,
        metricRule,
      })
      break;
    case 'metric':
      setProperties(alert, {
        podRule,
        workloadRule,
      })
      break;
    }

    return alert;
  },

  loadProjectResource({
    clusterId, projectId, groupId
  }) {
    const store = get(this, 'store');
    const globalStore = get(this, 'globalStore');
    const opt = { filter: { projectId } };
    let metrics

    if (this.isMonitoringEnabled()) {
      metrics = globalStore.rawRequest({
        url:    `monitormetrics?action=listprojectmetricname&limit=-1`,
        method: 'POST',
        data:   { projectId, }
      }).catch((err = {}) => {
        get(this, 'growl').fromError(get(err, 'body.message'));
      });
    }

    return hash({
      pods:         store.find('pod', null),
      statefulsets: store.find('statefulset', null, opt),
      daemonsets:   store.find('daemonset', null, opt),
      deployments:  store.find('deployment', null, opt),
      notifiers:    globalStore.find('notifier', null, { filter: { clusterId } }),
      metrics,
      alertRules:   globalStore.find('projectAlertRule'),
      alertGroup:   globalStore.find('projectAlertGroup', groupId),
    }).then(({
      pods, statefulsets, daemonsets, deployments, notifiers, metrics, alertRules, alertGroup
    }) => {
      return {
        pods,
        statefulsets,
        daemonsets,
        deployments,
        notifiers,
        metrics:    metrics && metrics.body && metrics.body.names,
        alertRules: alertRules.filter((g) => g.groupId === groupId).map((a) => {
          const alert = a.clone()

          return this.getNewProjectAlert(alert)
        }),
        alertGroup: alertGroup.clone(),
        mode:       'edit',
        level:      'group',
      }
    });
  },

});
