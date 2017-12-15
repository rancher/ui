import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  policyArray: null,
  actions: {
    addPolicy() {
      this.get('policyArray').pushObject({
        policyId: null,
      });
    },

    removePolicy(obj) {
      this.get('policyArray').removeObject(obj);
    },
  }
});
