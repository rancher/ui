import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  size: 'xs',
  showPrimary: true,

  resourceActions: Ember.inject.service('resource-actions'),

  tagName: 'div',
  classNames: ['btn-group','resource-actions','action-menu'],

  didInsertElement() {
    this.$().tooltip({
      selector: '*[tooltip]',
      animation: false,
      container: 'body',
      title: function() {
        return $(this).attr('tooltip');
      }
    });
  },

  click(e) {
    if ( Ember.$(e.target).closest('.resource-actions').length )
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
