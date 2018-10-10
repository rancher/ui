import Component from '@ember/component';
import layout from './template';
import { get, observer, set } from '@ember/object';

export default Component.extend({
  layout,
  tagName:         '',
  mode:            'default',
  cert:            null,
  allCertificates: null,
  editing:         null,

  modeChanged: observer('mode', function() {
    let out = null;

    if (get(this, 'mode') === 'custom') {
      out = get(this, 'allCertificates.firstObject.id');
    }

    set(this, 'cert.certificateId', out);
  }),
});
