import Ember from 'ember';

export default Ember.Route.extend({
  redirect() {
    if ( this.modelFor('authenticated').swarmReady )
    {
      this.transitionTo('applications-tab.compose-projects');
    }
  },

  model() {
    return Ember.RSVP.hash({
      hosts: this.get('store').findAllUnremoved('host'),
      machines: this.get('store').findAllUnremoved('machine'),
      stacks: this.get('store').findAllUnremoved('environment'),
      services: this.get('store').findAllUnremoved('service'),
    });
  },
});
