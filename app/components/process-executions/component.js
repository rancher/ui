import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Component.extend(Sortable, {
  expandAll: false,

  actions: {
    expandChildren: function() {
      Ember.run.next(() => {
      this.toggleProperty('expandAll');
      });
    }
  }
});
