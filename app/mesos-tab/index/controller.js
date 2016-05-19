import Ember from 'ember';

export default Ember.Controller.extend({
  activeHostCount: function() {
    return this.get('model.hosts').filterBy('state','active').get('length');
  }.property('model.hosts'),
});
