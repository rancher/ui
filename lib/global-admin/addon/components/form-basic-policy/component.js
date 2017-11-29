import Component from '@ember/component';
import layout from './template';
import C from 'ui/utils/constants';

const policies = C.BASIC_POD_SECURITY_POLICIES;

export default Component.extend({
  layout,

  classNames: ['accordion-wrapper'],

  model: null,
  basicPolicies: null,

  init() {
    this._super(...arguments);
    const basicPolicies = [];
    for (let i = 0; i < policies.length / 3; i++) {
      basicPolicies.push(policies.slice(i * 3, i * 3 + 3));
    }
    this.set('basicPolicies', basicPolicies);
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function (item) {
        item.toggleProperty('expanded');
      });
    }
  },

  statusClass: null,
  status: null,
});
