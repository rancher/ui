import Ember from 'ember';

export default Ember.View.extend({
  pods: function() {
    return (this.get('context.services')||[]).sortBy('name');
  }.property('context.services.[]'),
});
