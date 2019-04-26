import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed'
import EditOrClone from 'alert/mixins/edit-or-clone';

export default Route.extend(EditOrClone, {
  globalStore: service(),
  scope:       service(),
  growl:       service(),

  pageScope:   reads('scope.currentPageScope'),

  model(params) {
    const pageScope = get(this, 'pageScope');
    const ruleId = params.rule_id;
    const groupId = params.group_id;

    if (pageScope === 'cluster') {
      const cluster = window.l('route:application').modelFor('authenticated.cluster');
      const clusterId = cluster.get('id');

      return this.loadClusterResource({
        clusterId,
        ruleId,
        groupId,
      });
    } else {
      const project = window.l('route:application').modelFor('authenticated.project').get('project');
      const projectId = project.get('id');
      const clusterId = project.get('clusterId');

      return this.loadProjectResource({
        projectId,
        clusterId,
        ruleId,
        groupId,
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

  loadClusterResource({
    clusterId, ruleId, groupId
  }) {
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
      alertRule:  globalStore.find('clusterAlertRule', ruleId),
      alertGroup:   globalStore.find('clusterAlertGroup', groupId),
      metrics,
    }).then(({
      nodes, notifiers, alertRule, metrics, alertGroup
    }) => {
      return {
        nodes,
        notifiers,
        alertGroup,
        alertRule: this.loadClusterRule(alertRule.clone()),
        metrics:    metrics && metrics.body && metrics.body.names,
        mode:      'edit',
        level:     'rule',
      }
    });
  },

  loadProjectResource({
    clusterId, projectId, groupId, ruleId
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
      alertRule:    globalStore.find('projectAlertRule', ruleId),
      alertGroup:   globalStore.find('projectAlertGroup', groupId),
    }).then(({
      pods, statefulsets, daemonsets, deployments, notifiers, metrics, alertRule, alertGroup
    }) => {
      return {
        pods,
        statefulsets,
        daemonsets,
        deployments,
        notifiers,
        metrics:    metrics && metrics.body && metrics.body.names,
        alertGroup,
        alertRule: this.loadProjectRule(alertRule.clone()),
        mode:      'edit',
        level:     'rule',
      }
    });
  },

});
