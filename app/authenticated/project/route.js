import Ember from 'ember';

export default Ember.Route.extend({
  access    : Ember.inject.service(),
  projects  : Ember.inject.service(),

  model(params, transition) {
    var project = this.get('projects.current');

    if ( !project )
    {
      this.replaceWith('settings.projects');
      return;
    }

    // If the project ID in the URL is out of sync somehow, bail & try again
    if ( project.get('id') !== params.project_id )
    {
      this.replaceWith('authenticated');
      return;
    }

    return this.loadSchemas().then(() => {
      return Ember.Object.create({
        project: project,
      });
    }).catch((err) => {
      return this.loadingError(err, transition, null);
    });
  },

  afterModel(/*model, transition*/) {
    var auth = this.modelFor('authenticated');
    return this.get('projects.current').checkForWaiting(auth.get('hosts'));
  },

  loadingError(err, transition, ret) {
    var isAuthEnabled = this.get('access.enabled');

    if ( err && err.status && [401,403].indexOf(err.status) >= 0 && isAuthEnabled )
    {
      this.send('logout',transition,true);
      return;
    }

    this.transitionTo('authenticated');
    return ret;
  },

  loadSchemas() {
    var store = this.get('store');
    store.resetType('schema');
    return store.rawRequest({url:'schema', dataType: 'json'}).then((res) => {
      store._bulkAdd('schema', res.xhr.responseJSON.data);
    });
  },
});
