import Ember from 'ember';

export default Ember.Route.extend({
/*
  redirect: function() {
    var main = this.modelFor('applications-tab');
    if ( main.get('hosts.length') && main.get('services.length') )
    {
      this.transitionTo('environments');
    }
  },

  model: function() {
    var main = this.modelFor('applications-tab');
    if ( main.get('environments.length') > 0 )
    {
      main.set('environmentId', main.get('environments.firstObject.id'));
    }
    else
    {
      main.set('environmentId', null);
    }

    return main;
  }
*/
});
