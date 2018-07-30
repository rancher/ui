import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { computed, get, set } from '@ember/object';
import calculatePosition from 'shared/utils/calculate-position';


export default Component.extend({
  tooltipService:  service('tooltip'),
  resourceActions: service('resource-actions'),

  layout,
  tagName:         'div',
  classNames:      ['resource-actions', 'action-menu'],
  context:         null,
  inTooltip:       false,
  model:           null,
  size:            'xs',

  actions: {
    clickedAction(actionName) {
      get(this, 'resourceActions').triggerAction(actionName);
      set(get(this, 'tooltipService'), 'childOpened', false);
    },

    preload() {
      get(this, 'resourceActions').setActionItems(get(this, 'model'), get(this, 'context'));
    },

    actionsOpen() {
      set(get(this, 'tooltipService'), 'childOpened', true);
    },

    actionsClosed() {
      set(get(this, 'tooltipService'), 'childOpened', false);
      get(this, 'tooltipService').hide();
    },

    calculatePosition,
  },

  sizeClass: computed('size', function() {
    let size = get(this, 'size');

    if ( size && size !== 'md' ) {
      return `btn-${ size }`;
    }
  }),



  click(e) {
    var tgt = $(e.target); // eslint-disable-line
    var more = tgt.closest('.more-actions');

    if ( more && more.length ) {
      e.preventDefault();
      e.stopPropagation();

      if (get(this, 'inTooltip')) {
        set(get(this, 'resourceActions'), 'tooltipActions', true);
      } else {
        set(get(this, 'resourceActions'), 'tooltipActions', false);
      }

      get(this, 'resourceActions').setActionItems(get(this, 'model'), get(this, 'context'));
    }
  },
});
