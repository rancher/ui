import Ember from 'ember';

export default Ember.Controller.extend({
  environments: Ember.inject.controller(),
  mode: Ember.computed.alias('environments.mode'),

  arranged: function() {
    return this.get('model').sortBy('name','id');
  }.property('model.@each.{name,id}'),
});
