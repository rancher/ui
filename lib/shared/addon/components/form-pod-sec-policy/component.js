import Component from '@ember/component';
import layout from './template';
import { set } from '@ember/object';

export default Component.extend({
  layout,
  policies: null,
  config: null,
  actions: {
    removePolicy() {
      set(this, 'config', null);
    },
  },
  init() {
    this._super(...arguments);
    if (!this.get('expand')) {
      this.set('expand', function(item) {
        item.toggleProperty('expanded');
      });
    }
  },
});
