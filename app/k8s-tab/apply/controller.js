import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['name','kind','clone'],
  clone: false,
  name: null,
  kind: null,

  actions: {
    done() {
      this.send('goToPrevious');
    },

    cancel() {
      this.send('goToPrevious');
    },
  }
});
