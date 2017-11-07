import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  activate() {
    this._super();
    this.controllerFor('authenticated').setPageScope('clusters');
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
