import Ember from 'ember';
import { hasThings } from 'ui/authenticated/project/controller';

export default Ember.Route.extend({
  access    : Ember.inject.service(),

  model(params, transition) {
    var project = this.modelFor('authenticated').project;
    if ( !project )
    {
      this.replaceWith('settings.projects');
      return;
    }

    // If the project ID in the URL is out of sync somehow, bail
    if ( project.get('id') !== params.project_id )
    {
      this.replaceWith('authenticated');
      return;
    }

    return this.loadSchemas().then(() => {
      return this.loadStacks().then((stacks) => {
        hasThings(stacks, project, window.lc('authenticated'));

        return Ember.Object.create({
          project: project,
          stacks: stacks,
        });
      });
    }).catch((err) => {
      return this.loadingError(err, transition, null);
    });
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
    var project = this.modelFor('authenticated').project;
    var store = this.get('store');
    store.resetType('schema');
    return store.find('schema', null, {url: 'projects/'+project.get('id')+'/schemas', forceReload: true});
  },

  loadStacks() {
    return this.get('store').findAllUnremoved('environment');
  },

});
