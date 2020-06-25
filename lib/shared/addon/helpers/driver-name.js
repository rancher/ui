import Helper from '@ember/component/helper';
import { ucFirst } from 'shared/utils/util';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Helper.extend({
  intl: service(),

  compute(params/* , options*/) {
    const driver = params[0] || '';

    const intl = get(this, 'intl');
    const key = `nodeDriver.displayName.${ driver.toLowerCase() }`;
    let name = ucFirst(driver);

    if ( intl.exists(key) ) {
      name = intl.t(key);
    }

    return name;
  }
});
