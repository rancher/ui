import Ember from 'ember';

export default Ember.LinkComponent.extend({
  attributeBindings: ['role','aria-haspopup','aria-expanded'],

  willRender() {
    this._super(...arguments);
    this.set('models', this.get('attrs.models.value')||[]);
    this.set('queryParams', this.get('attrs.queryParams.value')||{});
  }
});
