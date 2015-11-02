import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['environmentId','containerId','hostId'],
  hostId: null,
  environmentId: null,
  containerId: null,
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
