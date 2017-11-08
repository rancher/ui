import { later } from '@ember/runloop';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  isDefault: function() {
    let source = this.get('source');
    if ( !source ) {
      return true;
    }

    if ( source === 'Database' ) {
      return false;
    }

    return this.get('value') === this.get('activeValue');
  }.property('source','value','activeValue'),

  delete() {
    return this._super().then((res) => {
      later(this,'reload',500);
      return res;
    });
  },
});
