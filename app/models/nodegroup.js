import Resource from 'ember-api-store/models/resource';
import { isEmpty } from '@ember/utils';

export default Resource.extend({
  type: 'nodegroup',

  validationErrors() {
    let errors = [];

    if (this?.requestSpotInstances && isEmpty(this?.spotInstanceTypes)) {
      errors.push('Node Groups requesting spot instances must include one or more spot instance types.');
    }

    if (errors.length > 0) {
      return errors;
    }

    errors = this._super(...arguments);

    return errors;
  },
});
