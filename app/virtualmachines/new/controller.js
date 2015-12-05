import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['environmentId','virtualMachineId','hostId'],
  hostId: null,
  environmentId: null,
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
