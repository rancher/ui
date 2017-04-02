import Ember from 'ember';

export default Ember.Component.extend({
  model           : null,
  size            : 'xs',
  inTooltip       : false,

  resourceActions : Ember.inject.service('resource-actions'),

  tagName         : 'div',
  classNames      : ['resource-actions','action-menu'],
  tooltipService  : Ember.inject.service('tooltip'),

  sizeClass: function() {
    let size = this.get('size');
    if ( size && size !== 'md' ) {
      return 'btn-'+size;
    }
  }.property('size'),

  click(e) {
    var tgt = Ember.$(e.target);
    var more = tgt.closest('.more-actions');
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

  sendToModel(action) {
    this.get('tooltipService').leave();
    this.get('model').send(action);
  },
});
