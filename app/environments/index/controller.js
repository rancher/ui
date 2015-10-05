import Ember from 'ember';

export default Ember.Controller.extend({
  mode: 'grouped',
  queryParams: ['mode'],

  arranged: function() {
    return this.get('model').sortBy('name','id');
  }.property('model.@each.{name,id}'),
});
