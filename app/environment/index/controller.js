import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    addService: function() {
      this.transitionTo('service.new', {
        queryParams: {
          environmentId: this.get('id'),
        },
      });
    },
  }
});
