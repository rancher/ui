import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['environmentId','containerId','hostId'],
  hostId: null,
  environmentId: null,
  containerId: null,
  editing: false,

  actions: {
    done() {
      this.transitionToRoute('container', this.get('model.instance.id'));
    },

    cancel() {
      this.send('goToPrevious');
    },
  }
});
