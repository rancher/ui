import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','serviceId','containerId','upgrade'],
  stackId: null,
  serviceId: null,
  containerId: null,
  upgrade: null,

  actions: {
    done() {
      if ( this.get('upgrade') ) {
        this.send('goToPrevious','stacks');
      } else {
        return this.transitionToRoute('stack', this.get('model.service.stackId'));
      }
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
