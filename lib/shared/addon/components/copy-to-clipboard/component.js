import { get, set, computed } from '@ember/object';
import { later } from '@ember/runloop';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';

const DELAY        = 1000;
const DEFAULT_TEXT = 'copyToClipboard.tooltip';

export default Component.extend({
  layout,
  tagName: 'span',

  model: null,

  /* Component Params*/
  buttonText:       null,
  tooltipText:      null,
  status:           null,
  color:            'bg-transparent',
  icon:             'icon-copy',
  size:             null,
  target:           null,
  clipboardText:    null,
  textChangedEvent: null,
  buttonClass:      null,

  init() {
    this._super(...arguments);
    // otherwise the tooltip doesn't show up on the first hover
    set(this, 'model', { tooltipText: DEFAULT_TEXT });
  },

  actions: {
    alertSuccess() {
      let orig = get(this, 'model.tooltipText');

      this.setProperties({
        status: 'success',
        model:  { tooltipText: 'copyToClipboard.copied' }
      });

      later(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.setProperties({
          status: null,
          model:  { tooltipText: orig }
        });
      }, DELAY);
    },
  },

  isSupported: computed('clipboardText', function() {
    return get(this, 'clipboardText.length') && (!isSafari || document.queryCommandSupported('copy'));
  }),

  buttonClasses: computed('status', function() {
    let status = get(this, 'status');
    let out = `btn ${ get(this, 'color') }`;

    if (status) {
      out += ' text-success';
    } else {
      out += ' text-muted';
    }

    if (get(this, 'size')) {
      out += ' small';
    }

    if (get(this, 'buttonClass')) {
      out += ` ${ get(this, 'buttonClass') }`;
    }

    return out;
  }),
  mouseEnter() {
    set(this, 'model', { tooltipText: DEFAULT_TEXT });
  },

});
