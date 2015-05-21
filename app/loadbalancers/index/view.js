import Ember from 'ember';

export default Ember.View.extend({
  pods: function() {
    return (this.get('context')||[]).sortBy('name');
  }.property('context.[]'),
});
