import Ember from 'ember';

export default Ember.Route.extend({
  access    : Ember.inject.service(),
  projects  : Ember.inject.service(),

  model(params/*, transition*/) {
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

    return Ember.Object.create({
      project: project,
    });
  },

  loadingError(err, transition, ret) {
    if ( err && err.status && [401,403].indexOf(err.status) >= 0 )
    {
      this.send('logout',transition,true);
      return;
    }

    this.transitionTo('authenticated');
    return ret;
  },
});
