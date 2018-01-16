import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Helper from '@ember/component/helper';

export default Helper.extend({
  access: service(),

  compute(params, options) {
    return !get(this, 'access').allows(options.resource, options.permission, options.scope);
  }
});
