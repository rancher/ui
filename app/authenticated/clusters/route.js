import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  scope: service(),
  activate() {
    this._super();
    this.get('scope').setPageScope('clusters');
  },

  model() {
    var userStore = this.get('userStore');
    return hash({
      projects: userStore.find('project', null, {url: 'projects', filter: {all: 'true'}, forceReload: true, removeMissing: true}),
      clusters: userStore.find('cluster', null, {url: 'clusters',                        forceReload: true, removeMissing: true}),
    }).then(() => {
      return {
        projects: userStore.all('project'),
        clusters: userStore.all('cluster'),
      };
    });
  },
});
