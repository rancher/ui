import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','serviceId','tab'],
  stackId: null,
  serviceId: null,
  tab: 'ssl',

  actions: {
    done() {
      return this.transitionToRoute('stack', this.get('model.service.stackId'));
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
