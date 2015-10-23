import Ember from 'ember';

export default Ember.Component.extend({
  batchSize: 1,
  interval: 2,
  startFirst: false,

  didInitAttrs() {
    this.optionsChanged();
  },

  optionsChanged() {
    this.sendAction('changed', {
      batchSize: this.get('batchSize'),
      intervalMillis: this.get('interval')*1000,
      startFirst: this.get('startFirst'),
    });
  },
});
