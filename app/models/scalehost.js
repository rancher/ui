import Resource from 'ember-api-store/models/resource';
import { computed } from '@ember/object';

export default Resource.extend({
  hostSelectorStr: computed('hostSelector', function() {
    let all = this.hostSelector || [];

    return Object.keys(all).map((key) => {
      let val = all[key];

      return key + (val ? `=${  val }` : '');
    })
      .join(', ');
  }),

  validationErrors() {
    let errors = this._super(...arguments);
    let min = parseInt(this.min, 10);
    let max = parseInt(this.max, 10);

    if ( min && max && min > max ) {
      errors.push('"Minimum Scale" cannot be greater than "Maximum Scale"');
    }

    return errors;
  }
});
