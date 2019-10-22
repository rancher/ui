import Helper from '@ember/component/helper';
import { observer } from '@ember/object'
import { A as EmberA } from '@ember/array';

export default Helper.extend({
  _haystack: null,

  shouldUpdate: observer('_haystack.[]', function() {
    this.recompute();
  }),

  compute(params) {
    let haystack = params[0];

    if (!haystack) {
      return;
    }
    let _haystack = this.get('_haystack');

    if (haystack !== _haystack) {
      _haystack = EmberA(haystack);
      this.set('_haystack', _haystack);
    }

    let result;

    for (let i = 1; i < params.length; i++) {
      let needle = params[i];

      if (needle) {
        result = _haystack.includes(needle);
      }

      if (!result) {
        return false;
      }
    }

    return result;
  }
});
