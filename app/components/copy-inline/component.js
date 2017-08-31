import Ember from 'ember';
import { isSafari } from 'ui/utils/platform';

const DELAY = 1000;
const DEFAULT_TEXT = 'copyToClipboard.tooltip';

export default Ember.Component.extend({
  tagName          : 'span',

  model            : null,

  /*Component Params*/
  buttonText       : null,
  tooltipText      : null,
  status           : null,
  size             : null,
  target           : null,
  clipboardText    : null,
  textChangedEvent : null,

  init() {
    this._super(...arguments);
    this.set('model', new Object({tooltipText: DEFAULT_TEXT}));
  },

  mouseEnter() {
    this.set('model', new Object({tooltipText: DEFAULT_TEXT}));
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

      Ember.run.later(() =>{
        this.setProperties({
          status: null,
          model: {tooltipText: orig}
        });
      }, DELAY);
    },
  },
});
