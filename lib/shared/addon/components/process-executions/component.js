import { next } from '@ember/runloop';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  expandAll: false,

  actions: {
    expandChildren: function() {
      next(() => {
      this.toggleProperty('expandAll');
      });
    }
  }
});
