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
  setDefaultRoute: on('activate', function() {
    set(this, `session.${ get(this, 'pageScope') === 'cluster' ? C.SESSION.CLUSTER_ROUTE : C.SESSION.PROJECT_ROUTE }`, `authenticated.${ get(this, 'pageScope') }.alert`);
  }),
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
  loadClusterResource(clusterId) {
    const gs = get(this, 'globalStore');
    // const clusterId = this.modelFor('cluster').get('id');
    const opt = { filter: { clusterId }, };
    const notifiers = gs.findAll('notifier', opt);
    const alerts = gs.findAll('clusterAlert', opt).then(() => {
      return gs.all('clusterAlert');
    });

    return hash({
      alerts,
      notifiers,
    });
  },
  loadProjectResource({ clusterId, projectId }) {
    let gs = get(this, 'globalStore');
    const notifiers = gs.findAll('notifier', { filter: { clusterId } });
    const alerts = gs.findAll('projectAlert', { filter: { projectId } }).then(() => {
      return gs.all('projectAlert');
    });

    return hash({
      alerts,
      notifiers,
    });
  },
});
