import Component from '@ember/component';
import layout from './template';
import { get, observer, set, setProperties } from '@ember/object';

const CUSTOM = 'custom';

export default Component.extend({
  layout,
  tagName:         '',
  mode:            'default',
  cert:            null,
  allCertificates: null,
  editing:         null,

  init() {
    this._super(...arguments);

    const found = (get(this, 'allCertificates') || []).findBy('id', get(this, 'cert.certificateId'));

    if ( found ) {
      set(this, 'mode', CUSTOM);
    }
  },

  modeChanged: observer('mode', function() {
    let certificateId = null;
    const mode = get(this, 'mode');

    if ( mode === CUSTOM) {
      certificateId = get(this, 'allCertificates.firstObject.id');
    }
    const cert = get(this, 'cert');

    setProperties(cert, {
      certificateId,
      mode
    });
  }),
});
