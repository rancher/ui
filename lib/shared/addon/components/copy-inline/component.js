import { later } from '@ember/runloop';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';
import { computed } from '@ember/object';

const DELAY = 1000;
const DEFAULT_TEXT = 'copyToClipboard.tooltip';

export default Component.extend({
  layout,
  tagName: 'span',

  model: null,

  /* Component Params*/
  buttonText:       null,
  tooltipText:      null,
  status:           null,
  size:             null,
  target:           null,
  clipboardText:    null,
  textChangedEvent: null,
  defaultText:      DEFAULT_TEXT,

  init() {
    this._super(...arguments);
    this.set('model', new Object({ tooltipText: this.get('defaultText') }));
  },

  actions: {
    alertSuccess() {
      let orig = this.get('model.tooltipText');

      this.setProperties({
        status: 'success',
        model:  { tooltipText: 'copyToClipboard.copied' }
      });

      later(() => {
        this.setProperties({
          status: null,
          model:  { tooltipText: orig }
        });
      }, DELAY);
    },
  },
  isSupported: computed('clipboardText', function() {
    return this.get('clipboardText.length') && (!isSafari || document.queryCommandSupported('copy'));
  }),

  mouseEnter() {
    this.set('model', new Object({ tooltipText: this.get('defaultText') }));
  },

});
