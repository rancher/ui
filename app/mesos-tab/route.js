import Ember from 'ember';

export default Ember.Route.extend({
  mesos: Ember.inject.service(),

  redirect() {
    if ( !this.modelFor('authenticated').mesosReady )
    {
      this.transitionTo('mesos-tab.waiting');
    }
  },

  model() {
    if ( this.modelFor('authenticated').mesosReady )
    {
      return Ember.RSVP.hash({
        containers: this.get('store').findAll('container'),
      });
    }
  },
});
