import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed'
import { get, set } from '@ember/object';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  scope:       service(),
  session:     service(),
  globalStore: service(),

  pageScope:       reads('scope.currentPageScope'),
  model() {
    const pageScope = get(this, 'pageScope');

    if (pageScope === 'cluster') {
      const cluster = window.l('route:application').modelFor('authenticated.cluster');
      const clusterId = cluster.get('id');

      return this.loadClusterResource(clusterId);
    } else {
      const project = window.l('route:application').modelFor('authenticated.project').get('project');
      const projectId = project.get('id');
      const clusterId = project.get('clusterId');

      return this.loadProjectResource({
        projectId,
        clusterId
      });
    }
  },
  setDefaultRoute: on('activate', function() {
    set(this, `session.${ get(this, 'pageScope') === 'cluster' ? C.SESSION.CLUSTER_ROUTE : C.SESSION.PROJECT_ROUTE }`, `authenticated.${ get(this, 'pageScope') }.alert`);
  }),
  loadClusterResource(clusterId) {
    const gs = get(this, 'globalStore');
    // const clusterId = this.modelFor('cluster').get('id');
    const opt = { filter: { clusterId }, };
    const notifiers = gs.find('notifier', null, opt);
    const alerts = gs.find('clusterAlertRule', null, opt).then(() => gs.all('clusterAlertRule'));
    const groups = gs.find('clusterAlertGroup', null, opt).then(() => gs.all('clusterAlertGroup'));

    return hash({
      alerts,
      notifiers,
      groups,
    });
  },
  loadProjectResource({ clusterId, projectId }) {
    let gs = get(this, 'globalStore');
    const notifiers = gs.find('notifier', null, { filter: { clusterId } });
    const alerts = gs.find('projectAlertRule', null, { filter: { projectId } }).then(() => gs.all('projectAlertRule'));
    const groups = gs.find('projectAlertGroup', null, { filter: { projectId } }).then(() => gs.all('projectAlertGroup'));

    return hash({
      alerts,
      notifiers,
      groups,
    });
  },
});
