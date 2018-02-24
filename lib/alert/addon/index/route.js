import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from "@ember/service";
import { reads } from '@ember/object/computed'
import { get } from '@ember/object';

export default Route.extend({
  scope: service(),
  pageScope: reads('scope.currentPageScope'),
  globalStore: service(),

  loadClusterResource(clusterId) {
    const gs = get(this, 'globalStore');
    // const clusterId = this.modelFor('cluster').get('id');
    const opt = {
      filter: {clusterId},
    };
    const notifiers = gs.findAll('notifier', opt);
    const alerts = gs.findAll('clusterAlert', opt).then(() => {
      return gs.all('clusterAlert');
    });
    return hash({
      alerts,
      notifiers,
    });
  },
  loadProjectResource({clusterId, projectId}) {
    let gs = get(this, 'globalStore');
    const notifiers = gs.findAll('notifier', {filter: {clusterId}});
    const alerts = gs.findAll('projectAlert', {filter: {projectId}}).then(() => {
      return gs.all('projectAlert');
    });
    return hash({
      alerts,
      notifiers,
    });
  },
  model(params, transition) {
    const pageScope = get(this, 'pageScope');
    if (pageScope === 'cluster') {
      const clusterId = transition.params['authenticated.cluster'].cluster_id;
      return this.loadClusterResource(clusterId);
    } else {
      const projectId = transition.params['authenticated.project'].project_id;
      const [clusterId] = projectId.split(':');
      return this.loadProjectResource({projectId, clusterId});
    }
  },
});
