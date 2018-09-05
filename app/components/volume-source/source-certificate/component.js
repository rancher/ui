import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,
  field:     'secret',

  defaultMode: null,
  editing:     true,

  didReceiveAttrs() {
    this._super(...arguments);

    const modeStr = get(this, 'config.defaultMode');

    if ( modeStr ) {
      set(this, 'defaultMode', (new Number(modeStr)).toString(8));
    } else {
      set(this, 'defaultMode', '400');
    }
  },

  modeDidChange: observer('defaultMode', function() {
    const octal = get(this, 'defaultMode') || '0';

    set(this, 'config.defaultMode', parseInt(octal, 8));
  }),
});
