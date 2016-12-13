import Ember from 'ember';
import { isSafari } from 'ui/utils/platform';

const DELAY = 1000;
const DEFAULT_TEXT = 'copyToClipboard.tooltip';

export default Ember.Component.extend({
  tagName          : 'div',
  classNames       : ['copy-button-container', 'inline-block'],

  model            : null,

  /*Component Params*/
  buttonText       : null,
  tooltipText      : null,
  status           : null,
  size             : null,
  target           : null,
  clipboardText    : null,
  textChangedEvent : null,

  mouseEnter() {
    this.set('model', new Object({tooltipText: DEFAULT_TEXT}));
  },

  click: function(evt) {
    this.set('textChangedEvent', Ember.$(evt.currentTarget));
  },

  isSupported: function() {
    return this.get('clipboardText.length') && (!isSafari || document.queryCommandSupported('copy'));
  }.property('clipboardText'),

  actions: {
    alertSuccess: function() {
      this.set('status', 'success');
      let orig = this.get('model.tooltipText');
      this.set('model', new Object({tooltipText: 'copyToClipboard.copied'}));

      Ember.run.later(() =>{
        this.set('status', null);
        this.set('model', new Object({tooltipText: orig}));
      }, DELAY);
    },
  },

  buttonClasses: Ember.computed('status', function() {
    let status = this.get('status');
    let out = '';

    if (status) {
      out = `btn btn-success`;
    } else {
      out = `btn btn-primary`;
    }

    if (this.get('size')) {
      out = `${out} small btn-link`;
    }

    return out;

  }),
});
