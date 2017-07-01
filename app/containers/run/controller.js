import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','serviceId','containerId','launchConfigIndex','upgrade'],
  stackId: null,
  serviceId: null,
  containerId: null,
  launchConfigIndex: null,
  upgrade: null,

  actions: {
    done() {
      this.send('goToPrevious','containers.index');
    },

    cancel() {
      this.send('goToPrevious','containers.index');
    },
  },
});
