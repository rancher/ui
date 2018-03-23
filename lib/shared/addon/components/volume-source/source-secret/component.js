import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,

  specific: false,
  defaultMode: null,

  inputDidUpdate: observer('config.{defaultMode,optional,secretId,items}', function () {
    this.sendUpdate();
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    if (!!get(this, 'config.items')) {
      set(this, 'specific', true);
    }

    const modeStr = get(this,'config.defaultMode');
    if ( modeStr ) {
      set(this, 'defaultMode', (new Number(modeStr)).toString(8));
    } else {
      set(this, 'defaultMode', '400');
    }
  },

  specificDidChange: observer('specific', function () {
    if(!get(this, 'specific')){
      set(this, 'config.items', null);
    }
    }),

  modeDidChange: observer('defaultMode', function() {
    const octal = get(this,'defaultMode')||'0';
    set(this,'config.defaultMode', parseInt(octal,8));
  }),
});
