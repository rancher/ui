import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','serviceId','tab','upgrade'],
  stackId: null,
  serviceId: null,
  tab: 'ssl',
  upgrade: null,

  actions: {
    done() {
      return this.transitionToRoute('stack', this.get('model.service.stackId'));
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
