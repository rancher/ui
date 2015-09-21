import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    expandChildren: function() {
      this.toggleProperty('childrenExpanded');
    }
  },
  childrenExpanded: false
});
