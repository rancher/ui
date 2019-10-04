import { next } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import $ from 'jquery';

const PROTOCOL_OPTIONS = [
  {
    label: 'TCP',
    value: 'TCP'
  },
  {
    label: 'UDP',
    value: 'UDP'
  }
];

export default Component.extend({
  layout,

  protocolOptions: PROTOCOL_OPTIONS,
  editing:         true,
  ports:           alias('model.ports'),

  init() {
    this._super(...arguments);

    if ( !get(this, 'ports') ) {
      set(this, 'model.ports', []);
    }
  },

  actions: {
    addPort() {
      get(this, 'ports').pushObject(get(this, 'store').createRecord({
        type:          'servicePort',
        protocol:      'TCP',
      }));

      next(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        $('INPUT.public').last()[0].focus();
      });
    },

    removePort(obj) {
      get(this, 'ports').removeObject(obj);
    },
  },
});
