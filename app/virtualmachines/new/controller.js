import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','virtualMachineId','hostId'],
  hostId: null,
  stackId: null,
  virtualMachineId: null,
  editing: false,

  actions: {
    done() {
      this.send('goToPrevious');
    },

    cancel() {
      this.send('goToPrevious');
    },
  }
});
