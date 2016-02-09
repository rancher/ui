import Ember from 'ember';

export default Ember.Component.extend({
  model       : null,
  size        : 'xs',
  showPrimary : true,
  inTooltip   : false,

  resourceActions: Ember.inject.service('resource-actions'),

  tagName        : 'div',
  classNames     : ['btn-group','resource-actions','action-menu'],
  tooltipService : Ember.inject.service('tooltip'),

  click(e) {
    var more = Ember.$(e.target).closest('.more-actions');
    if ( more && more.length ) {
      e.preventDefault();
      e.stopPropagation();

      if (this.get('inTooltip')) {
        this.get('resourceActions').set('tooltipActions', true);
      } else {
        this.get('resourceActions').set('tooltipActions', false);
      }

      this.get('resourceActions').show(this.get('model'), more, this.$());
    }
  },

  actions: {
    sendAction: function(action) {
      this.get('tooltipService').leave();
      this.get('model').send(action);
    }
  },
});
