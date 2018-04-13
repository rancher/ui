import { later } from '@ember/runloop';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({

  delete() {
    return this._super().then((res) => {
      later(this,'reload',500);
      return res;
    });
  },
});
