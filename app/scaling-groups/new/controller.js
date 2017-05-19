import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','serviceId','containerId','upgrade'],
  stackId: null,
  serviceId: null,
  containerId: null,
  upgrade: null,

  actions: {
    done() {
      this.send('goToPrevious','scaling-groups.index');
    },

    cancel() {
      this.send('goToPrevious','scaling-groups.index');
    },
  },
});
