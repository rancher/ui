import Component from '@ember/component';
import layout from './template'

export default Component.extend({
  layout,
  expandAll: false,
  actions: {
    expandAll: function() {
      this.toggleProperty('expandAll');
    }
  },
  expand: function(item) {
    item.toggleProperty('expanded');
  },
});
