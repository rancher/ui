import Component from '@ember/component';
import { observer, get, set } from '@ember/object';
import { alias } from '@ember/object/computed'

export default Component.extend({
  sslVersionContent: [{
    label: 'SSLv23',
    value: 'SSLv23',
  }, {
    label: 'TLSv1',
    value: 'TLSv1',
  }, {
    label: 'TLSv1_1',
    value: 'TLSv1_1',
  }, {
    label: 'TLSv1_2',
    value: 'TLSv1_2',
  }],
  sslVerify: alias('config.sslVerify'),

  sslVerifyChange: observer('sslVerify', function() {
    if (!get(this, 'sslVerify') && get(this, 'targetType') !== 'kafka') {
      if (get(this, 'config')) {
        set(this, 'config.certificate', null)
      }
    }
  }),

});
