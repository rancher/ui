import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { computed, get } from '@ember/object';
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

  sizeClass: computed('size', function() {

    let size = this.get('size');

    if ( size && size !== 'md' ) {

      return `btn-${ size }`;

    }

  }),


  actions: {

    clickedAction(actionName) {

      this.get('resourceActions').triggerAction(actionName);

    },

    closeLater(dd) {

      dd.actions.close();

      return true;

    },

    preload() {

      this.get('resourceActions').setActionItems(this.get('model'), this.get('context'));

    },

    actionsOpen() {

      get(this, 'tooltipService').set('childOpened', true);

    },

    actionsClosed() {

      get(this, 'tooltipService').set('childOpened', false);
      get(this, 'tooltipService').hide();

    },

    calculatePosition,

  },

  click(e) {

    var tgt = $(e.target); // eslint-disable-line
    var more = tgt.closest('.more-actions');

    if ( more && more.length ) {

      e.preventDefault();
      e.stopPropagation();

      if (this.get('inTooltip')) {

        this.get('resourceActions').set('tooltipActions', true);

      } else {

        this.get('resourceActions').set('tooltipActions', false);

      }

      this.get('resourceActions').setActionItems(this.get('model'), this.get('context'));

    }

  },
});
