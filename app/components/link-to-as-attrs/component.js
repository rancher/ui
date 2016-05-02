import Ember from 'ember';

// This is a link-to where models (path components) and query-params can be set as attribtues instead of positional params
export default Ember.LinkComponent.extend({
  attributeBindings: ['role','aria-haspopup','aria-expanded'],

  willRender() {
    this._super(...arguments);
    this.set('models', this.get('attrs.models.value')||[]);
    this.set('queryParams', {
      isQueryParams: true,
      values: this.get('attrs.queryParams.value')||{}
    });
  }
});
