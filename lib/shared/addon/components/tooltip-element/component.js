import { later, cancel, next } from '@ember/runloop';
import $ from 'jquery';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

const DELAY = 100;

export default Component.extend({
  tooltipService:    service('tooltip'),
  layout,
  classNameBindings: ['inlineBlock:vertical-middle', 'clip:clip'],
  tagName:           'span',
  inlineBlock:       false,
  clip:              false,
  model:             null,
  size:              'default',
  ariaRole:          ['tooltip'],
  textChangedEvent:  null,
  tooltipFor:        null,

  showTimer: null,

  textChanged: observer('textChangedEvent', function() {
    this.show(this.get('textChangedEvent'));
  }),

  modelObserver: observer('model', 'textChangedEvent', function() {
    let opts = this.get('tooltipService.tooltipOpts');

    if ((opts) && this.get('tooltipFor') === opts.tooltipFor ) {
      next(() => {
        this.set('tooltipService.tooltipOpts.model', this.get('model'));
      });
    }
  }),
  mouseEnter(evt) {
    if ( !this.get('tooltipService.requireClick') ) {
      let tgt = $(evt.currentTarget);

      if (this.get('tooltipService.tooltipOpts')) {
        this.set('tooltipService.tooltipOpts', null);
      }

      if (this.get('model')) {
        // Wait for a little bit of time so that the mouse can pass through
        // another tooltip-element on the way to the dropdown trigger of a
        // tooltip-action-menu without changing the tooltip.
        this.set('showTimer', later(() => {
          this.show(tgt);
        }, DELAY));
      }
    }
  },

  show(node) {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    let svc = this.get('tooltipService');

    this.set('showTimer', null);
    svc.cancelTimer();

    let out = {
      type:          this.get('type'),
      baseClass:     this.get('baseClass'),
      eventPosition: node.offset(),
      originalNode:  node,
      model:         this.get('model'),
      template:      this.get('tooltipTemplate'),
      tooltipFor:    this.get('tooltipFor'),
      placement:     this.get('placement'),
    };

    if ( this.get('isCopyTo') ) {
      out.isCopyTo = true;
    }

    svc.set('tooltipOpts', out);
  },

  mouseLeave() {
    if (!this.get('tooltipService.openedViaContextClick')) {
      if ( this.get('showTimer') ) {
        cancel(this.get('showTimer'));
      } else {
        this.get('tooltipService').leave();
      }
    }
  },

});
