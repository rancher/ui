import LinkComponent from '@ember/routing/link-component';

import { computed, set, get } from '@ember/object';

// This is a link-to where models (path components) and query-params can be set as attribtues instead of positional params
export default LinkComponent.extend({
  attributeBindings: ['role', 'aria-haspopup', 'aria-expanded'],


  didReceiveAttrs() {
    set(this, 'params', [get(this, 'attrs.ourRoute.value'), ...( get(this, 'attrs.ctx.value') || [] )]);

    if (get(this, 'attrs.qp.value')) {
      get(this, 'params').pushObject(get(this, 'attrs.qp.value'));
    }

    this._super(...arguments);
  },

  'current-when': computed('onlyCurrentWhen', function() {
    let base = get(this, 'qualifiedRouteName');

    if ( get(this, 'onlyCurrentWhen.length') ) {
      return get(this, 'onlyCurrentWhen').concat(base).join(' ');
    }
  }),

  queryParams: computed('attrs.qp.value', function(){
    return {
      isQueryParams: true,
      values:        get(this, 'attrs.qp.value') || {}
    };
  }),

});
