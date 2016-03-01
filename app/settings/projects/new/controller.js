import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    done() {
      this.send('refreshKubernetes');
      this.send('goToPrevious');
    },

    cancel() {
      this.send('goToPrevious');
    }
  }
});
