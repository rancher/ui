import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export default Component.extend({
  layout,
  model           : null,
  size            : 'xs',
  inTooltip       : false,

  resourceActions : service('resource-actions'),

  tagName         : 'div',
  classNames      : ['resource-actions','action-menu'],
  tooltipService  : service('tooltip'),

  sizeClass: function() {
    let size = this.get('size');
    if ( size && size !== 'md' ) {
      return 'btn-'+size;
    }
  }.property('size'),

  click(e) {
    var tgt = $(e.target);
    var more = tgt.closest('.more-actions');
    var offsets = {
      y: 1,
      x: 2,
      mirror: true
    };
    if ( more && more.length ) {
      e.preventDefault();
      e.stopPropagation();

      if (this.get('inTooltip')) {
        this.get('resourceActions').set('tooltipActions', true);
      } else {
        this.get('resourceActions').set('tooltipActions', false);
      }

      this.get('resourceActions').show(this.get('model'), more, this.$(), offsets);
    }
  },

  sendToModel(action) {
    this.get('tooltipService').leave();
    this.get('model').send(action);
  },
});
