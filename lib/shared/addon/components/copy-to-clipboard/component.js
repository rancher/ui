import { computed } from '@ember/object';
import { later } from '@ember/runloop';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';

const DELAY        = 1000;
const DEFAULT_TEXT = 'copyToClipboard.tooltip';

export default Component.extend({
  layout,
  tagName          : 'span',

  model            : null,

  /*Component Params*/
  buttonText       : null,
  tooltipText      : null,
  status           : null,
  icon             : 'icon-copy',
  size             : null,
  target           : null,
  clipboardText    : null,
  textChangedEvent : null,

  init() {
    this._super(...arguments);
    // otherwise the tooltip doesn't show up on the first hover
    this.set('model', {tooltipText: DEFAULT_TEXT});
  },
  mouseEnter() {
    this.set('model', {tooltipText: DEFAULT_TEXT});
  },

  isSupported: function() {
    return this.get('clipboardText.length') && (!isSafari || document.queryCommandSupported('copy'));
  }.property('clipboardText'),

  actions: {
    alertSuccess: function() {
      let orig = this.get('model.tooltipText');

      this.setProperties({
        status: 'success',
        model: {tooltipText: 'copyToClipboard.copied'}
      });

      later(() =>{
        this.setProperties({
          status: null,
          model: {tooltipText: orig}
        });
      }, DELAY);
    },
  },

  buttonClasses: computed('status', function() {
    let status = this.get('status');
    let out = 'btn bg-transparent';

    if (status) {
      out += ' text-success';
    } else {
      out += ' text-muted';
    }

    if (this.get('size')) {
      out += ' small';
    }

    return out;

  }),
});
