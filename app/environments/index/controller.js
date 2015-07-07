import Ember from 'ember';

export default Ember.Controller.extend({
  arranged: function() {
    return this.get('model').sortBy('name','id');
  }.property('model.@each.{name,id}'),
});
