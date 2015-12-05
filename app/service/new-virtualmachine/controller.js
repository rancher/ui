import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['environmentId','serviceId','virtualMachineId','upgrade'],
  environmentId: null,
  serviceId: null,
  virtualMachineId: null,
  upgrade: null,

  actions: {
    done() {
      return this.transitionToRoute('environment', this.get('model.service.environmentId'));
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
