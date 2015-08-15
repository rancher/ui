import Ember from 'ember';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  beforeModel: function(transition) {
    transition.send('logout');
  }
});
