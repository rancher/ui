import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  choices: null,
  addAction: null,

  classNames: ['resource-actions'],

  activeActions: function() {
    return (this.get('choices')||[]).filter(function(act) {
      return Ember.get(act,'enabled');
    });
  }.property('choices.[]','choices.@each.enabled'),

  actions: {
    add: function() {
      this.get('model').send(this.get('addAction'));
    },

    clicked: function(actionName) {
      this.get('model').send(actionName);
    }
  }
});
