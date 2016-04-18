import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.RSVP.hash({
      hosts: this.get('store').findAllUnremoved('host'),
      machines: this.get('store').findAllUnremoved('machine'),
      stacks: this.get('store').findAllUnremoved('environment'),
      services: this.get('store').findAllUnremoved('service'),
    });
  },
});
