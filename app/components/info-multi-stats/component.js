import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  model:         null,
  mode:          'small',
  smallWidth:    60,
  smallHeight:   25,
  largeTargetId: null,
  linkName:      'containerStats',

  tagName:   '',
  cpuFields: [{
    key:         'cpuUser',
    displayName: 'infoMultiStats.cpuSection.user'
  }, {
    key:         'cpuSystem',
    displayName: 'infoMultiStats.cpuSection.system'
  }],
  memoryFields: [{
    key:         'memory',
    displayName: 'infoMultiStats.memorySection.used'
  }],
  networkFields: [{
    key:         'networkTx',
    displayName: 'infoMultiStats.networkSection.transmit'
  }, {
    key:         'networkRx',
    displayName: 'infoMultiStats.networkSection.receive'
  }],
  storageFields: [{
    key:         'storageWrite',
    displayName: 'infoMultiStats.storageSection.write'
  }, {
    key:         'storageRead',
    displayName: 'infoMultiStats.storageSection.read'
  }],

  actions: {
    toggle() {

      this.set('mode', (this.get('mode') === 'small' ? 'large' : 'small'));

    },
  },
});
