import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,

  specific: false,

  inputDidUpdate: observer('config.{defaultMode,optional,secretId,items}', function () {
    this.sendUpdate();
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    if (!!get(this, 'config.items')) {
      set(this, 'specific', true);
    }
  },

  specificDidChange: observer('specific', function () {
    if(!get(this, 'specific')){
      set(this, 'config.items', null);
    }
  }),
});
