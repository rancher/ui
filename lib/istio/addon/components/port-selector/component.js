import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object'
import { isNumeric } from 'shared/utils/util';

export default Component.extend({
  layout,

  editing: true,
  model:   null,

  init() {
    this._super(...arguments);
    this.initPort();
  },

  portNumberOrNameDidChange: observer('portNumberOrName', function() {
    const port = get(this, 'portNumberOrName');
    const model = get(this, 'model');

    if ( port && isNumeric(port) ) {
      set(model, 'port', { number: parseInt(port, 10) });
    } else if ( port ) {
      set(model, 'port', { name: port });
    } else {
      delete model['port'];
    }
  }),

  initPort() {
    const port = get(this, 'model.port');

    if ( port ) {
      set(this, 'portNumberOrName', get(port, 'name') || get(port, 'number') || null);
    }
  }
});
