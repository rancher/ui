import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    newContainer: function() {
      this.transitionToRoute('containers.new', {queryParams: {hostId: this.get('id')}});
    },
  },
});
