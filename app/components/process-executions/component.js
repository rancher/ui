import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Component.extend(Sortable, {
  actions: {
    expandChildren: function() {
      this.toggleProperty('childrenExpanded');
    }
  },
  childrenExpanded: false
});
