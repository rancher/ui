import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','serviceId'],
  stackId: null,
  serviceId: null,

  actions: {
    done() {
      return this.transitionToRoute('stack', this.get('model.service.stackId'));
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
