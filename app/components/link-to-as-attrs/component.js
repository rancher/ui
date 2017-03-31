import Ember from 'ember';

// This is a link-to where models (path components) and query-params can be set as attribtues instead of positional params
export default Ember.LinkComponent.extend({
  attributeBindings: ['role','aria-haspopup','aria-expanded'],

  'current-when': function() {
    let base = this.get('qualifiedRouteName');
    if ( this.get('moreCurrentWhen.length') ) {
      return this.get('moreCurrentWhen').concat(base).join(' ');
    }
  }.property('moreCurrentWhen'),

  queryParams: Ember.computed('attrs.queryParams.value', function(){
    return {
      isQueryParams: true,
      values: this.get('attrs.queryParams.value')||{}
    };
  }),

  willRender() {
    this._super(...arguments);
    this.set('models', this.get('attrs.models.value')||[]);
  }
});
