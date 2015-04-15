import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['environment'],
  actions: {
    addService: function() {
      this.get('controllers.environment').send('addService');
    },
  },
});
