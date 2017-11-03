import Ember from 'ember';

export default Ember.Component.extend({
  expandAll: false,

  actions: {
    expandChildren: function() {
      Ember.run.next(() => {
      this.toggleProperty('expandAll');
      });
    }
  }
});
