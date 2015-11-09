import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  size: 'xs',
  showPrimary: true,

  resourceActions: Ember.inject.service('resource-actions'),

  tagName: 'div',
  classNames: ['btn-group','resource-actions','action-menu'],

  click(e) {
    if ( Ember.$(e.target).closest('.more-actions').length )
    {
      e.preventDefault();
      e.stopPropagation();
      this.get('resourceActions').show(this.get('model'), e.target, this.$());
    }
  },

  actions: {
    sendAction: function(action) {
      this.get('model').send(action);
    }
  },
});
