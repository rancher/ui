import Ember from 'ember';

const DELAY = 2000;

export default Ember.Component.extend({
  tagName       : '',
  tooltipText   : null,
  status        : null,
  size          : null,
  target        : null,
  clipboardText : null,

  actions: {
    alertSuccess: function() {
      this.set('status', 'success');
      this.set('tooltipText', 'Copied!');

      Ember.run.later(() =>{
        this.set('status', null);
        this.set('tooltipText', 'Copy To Clipboard');
      }, DELAY);
    },
  },

  setup: function() {
    this.set('tooltipText', 'Copy To Clipboard');
  }.on('init'),

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
