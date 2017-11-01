import Helper from '@ember/component/helper';
import {observer} from '@ember/object'
import { A as EmberA } from '@ember/array';

export default Helper.extend({
  _haystack: null,

  shouldUpdate: observer('_haystack.[]', function(){
    this.recompute();
  }),

  compute(params) {
    let haystack = params[0];
    let needle = params[1];

    if (!haystack) {
      return;
    }

    let _haystack = this.get('_haystack');
    if (haystack !== _haystack) {
      _haystack = new EmberA(haystack);
      this.set('_haystack', _haystack);
    }
    return _haystack.includes(needle);
  }
});
