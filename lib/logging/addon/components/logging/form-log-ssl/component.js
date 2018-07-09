import Component from '@ember/component';
import {
  observer, get, set
} from '@ember/object';
import { alias } from '@ember/object/computed'

export default Component.extend({
  sslVerify: alias('config.sslVerify'),

  sslVerifyChange: observer('sslVerify', function() {

    if (!get(this, 'sslVerify') && get(this, 'targetType') !== 'kafka') {

      if (get(this, 'config')) {

        set(this, 'config.certificate', null)

      }

    }

  }),
});
