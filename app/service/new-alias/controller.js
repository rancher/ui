import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['environmentId','serviceId'],
  environmentId: null,
  serviceId: null,

  actions: {
    done() {
      return this.transitionToRoute('environment', this.get('model.service.environmentId'));
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
