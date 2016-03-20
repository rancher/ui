import Ember from 'ember';
import { isSafari } from 'ui/utils/platform';

const DELAY = 2000;

export default Ember.Component.extend({
  tagName          : 'div',
  classNames       : ['copy-button-container', 'inline-block'],
  buttonText       : null,
  tooltipText      : null,
  status           : null,
  size             : null,
  target           : null,
  clipboardText    : null,
  textChangedEvent : null,

  bootstrap: function() {
    this.set('tooltipText', 'Copy To Clipboard');
  }.on('init'),

  click: function(evt) {
    this.set('textChangedEvent', Ember.$(evt.currentTarget));
  },

  isSupported: function() {
    return this.get('clipboardText.length') && (!isSafari || document.queryCommandSupported('copy'));
  }.property('clipboardText'),

  actions: {
    alertSuccess: function() {
      this.set('status', 'success');
      let orig = this.get('tooltipText');
      this.set('tooltipText', 'Copied!');

      Ember.run.later(() =>{
        this.set('status', null);
        this.set('tooltipText', orig);
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
