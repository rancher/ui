import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','scalingGroupId','containerId','hostId','upgrade'],
  editing: false,
  hostId: null,
  stackId: null,
  containerId: null,
  scalingGroupId: null,
  mode: 'container',

  upgrade: null,

  actions: {
    done() {
      this.send('goToPrevious','containers.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  }
});
