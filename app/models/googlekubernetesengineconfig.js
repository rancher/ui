import Resource from '@rancher/ember-api-store/models/resource';

export default Resource.extend({
  type: 'googleKubernetesEngineConfig',

  reservedKeys: [],

  validationErrors() {
    let errors = [];

    if (!this.get('credential')) {
      errors.push('"Service Account" is required');
    } else if (!this.get('projectId')){
      errors.push('"Google Project ID" is required');
    }
    if (errors.length > 0) {
      return errors;
    }
    errors = this._super(...arguments);

    return errors;
  },
});
