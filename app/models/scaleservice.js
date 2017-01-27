import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  validationErrors() {
    let errors = this._super(...arguments);
    let min = parseInt(this.get('min'),10);
    let max = parseInt(this.get('max'),10);
    if ( min && max && min > max ) {
      errors.push('"Minimum Scale" cannot be greater than "Maximum Scale"');
    }

    return errors;
  }
});
