import Ember from 'ember';

export default Ember.Component.extend({
  resourceActions: Ember.inject.service('resource-actions'),

  tagName: 'div',

  classNames: [/*,'pull-right', */ 'btn-group','graph-actions'/*, 'btn-group-xs'*/],

  model: null,

  click(event) {
    event.preventDefault();
    event.stopPropagation();
    if (Ember.$(event.target).is('#dropdown-toggler')) {
      this.get('resourceActions').show(this.get('model'), event.target, this.$());
    }
  },

  actions: {
    sendAction: function(action) {
      this.get('model').send(action);
    }
  },
});
