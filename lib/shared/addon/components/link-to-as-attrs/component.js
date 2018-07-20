import LinkComponent from '@ember/routing/link-component';

import { computed } from '@ember/object';

// This is a link-to where models (path components) and query-params can be set as attribtues instead of positional params
export default LinkComponent.extend({
  attributeBindings: ['role', 'aria-haspopup', 'aria-expanded'],

  willRender() {
    this._super(...arguments);
    this.set('models', this.get('attrs.models.value') || []);
  },
  'current-when': function() {
    let base = this.get('qualifiedRouteName');

    if ( this.get('onlyCurrentWhen.length') ) {
      return this.get('onlyCurrentWhen').concat(base).join(' ');
    }
  }.property('onlyCurrentWhen'),

  queryParams: computed('attrs.qp.value', function(){
    return {
      isQueryParams: true,
      values:        this.get('attrs.qp.value') || {}
    };
  }),

});
