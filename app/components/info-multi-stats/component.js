import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  mode: 'small',
  smallWidth: 60,
  smallHeight: 25,
  largeTargetId: null,
  linkName: 'containerStats',

  tagName: '',
  cpuFields: ['cpuUser','cpuSystem'],
  memoryFields: ['memory'],
  networkFields: ['networkTx','networkRx'],
  storageFields: ['storageWrite','storageRead'],

  actions: {
    toggle() {
      this.set('mode', (this.get('mode') === 'small' ? 'large' : 'small'));
    },
  },
});
