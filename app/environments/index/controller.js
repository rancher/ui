import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['environments'],
  mode: Ember.computed.alias('controllers.environments.mode'),

  arranged: function() {
    return this.get('model').sortBy('name','id');
  }.property('model.@each.{name,id}'),
});
