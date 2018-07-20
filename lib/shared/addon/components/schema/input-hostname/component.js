import Component from '@ember/component';
import { next } from '@ember/runloop';
import { get, set, observer } from '@ember/object'
import layout from './template';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

export default Component.extend({
  settings: service(),

  layout,

  value: '',
  mode:  'automatic',

  init() {
    this._super(...arguments);

    const xip = get(this, `settings.${ C.SETTING.INGRESS_IP_DOMAIN }`);
    const host = get(this, 'value');

    if ( host && host === xip ) {
      set(this, 'mode', 'automatic');
    } else if ( host ) {
      set(this, 'mode', 'manual');
    }

    next(() => {
      this.modeChanged();
    });
  },

  modeChanged: observer('mode', function() {
    const mode = get(this, 'mode');

    const xip = get(this, `settings.${ C.SETTING.INGRESS_IP_DOMAIN }`);

    if ( mode === 'automatic' ) {
      set(this, 'value', xip);
    } else {
      if ( get(this, 'value') === xip ) {
        set(this, 'value', '');
      }
    }
  }),
});
