import Ember from 'ember';

export default Ember.Route.extend({
  activate() {
    this._super();
    this.controllerFor('authenticated').setPageScope('clusters');
  },

  model() {
    var userStore = this.get('userStore');
    return Ember.RSVP.hash({
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
