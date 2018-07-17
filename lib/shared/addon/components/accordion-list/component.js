import Component from '@ember/component';
import layout from './template'

export default Component.extend({
  layout,
  showExpandAll: true,
  expandAll:     false,
  actions:       {
    expandAll() {
      this.toggleProperty('expandAll');
    }
  },
  expand(item) {
    item.toggleProperty('expanded');
  },
});
