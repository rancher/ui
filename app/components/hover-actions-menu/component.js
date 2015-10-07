import Ember from 'ember';

export default Ember.Component.extend({
  resourceActions: Ember.inject.service('resource-actions'),

  model: null,

  classNames: ['resource-actions'],

  click(event) {
    event.preventDefault();
    this.get('resourceActions').show(this.get('model'), event.target, this.$());
  },

  actions: {
    clicked: function(actionName) {
      this.get('model').send(actionName, this.get('parentController'));
    }
  },
});
