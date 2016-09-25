import Ember from 'ember';
import { isAlternate } from 'ui/utils/platform';

export default Ember.Component.extend({
  model           : null,
  size            : 'xs',
  showPrimary     : true,
  inTooltip       : false,

  resourceActions : Ember.inject.service('resource-actions'),

  tagName         : 'div',
  classNames      : ['btn-group','resource-actions','action-menu'],
  tooltipService  : Ember.inject.service('tooltip'),

  primaryAction   : Ember.computed.alias('model.primaryAction'),

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
    } else {
      let idx = parseInt(tgt.closest('BUTTON').data('primary'),10);
      if ( !isNaN(idx) ) {
        var action = this.get('model.primaryAction');
        if ( action ) {
          e.preventDefault();
          e.stopPropagation();

          if ( isAlternate(e) && Ember.get(action,'altAction') ) {
            this.sendToModel(Ember.get(action,'altAction'));
          } else {
            this.sendToModel(Ember.get(action,'action'));
          }
        }
      }
    }
  },

  sendToModel(action) {
    this.get('tooltipService').leave();
    this.get('model').send(action);
  },
});
