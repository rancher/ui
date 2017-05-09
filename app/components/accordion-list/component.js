import Ember from 'ember';

export default Ember.Component.extend({
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
