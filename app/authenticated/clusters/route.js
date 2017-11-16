import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  clsuterStore: service('cluster-store'),
  scope: service(),
  activate() {
    this._super();
    this.get('scope').setPageScope('clusters');
  },

  model() {
    var clusterStore = this.get('clusterStore');
    return hash({
      projects: clusterStore.find('project', null, {url: 'projects', filter: {all: 'true'}, forceReload: true, removeMissing: true}),
      clusters: clusterStore.find('cluster', null, {url: 'clusters',                        forceReload: true, removeMissing: true}),
    }).then(() => {
      return {
        projects: clusterStore.all('project'),
        clusters: clusterStore.all('cluster'),
      };
    });
  },
});
