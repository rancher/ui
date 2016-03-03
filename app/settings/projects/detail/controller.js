import Ember from 'ember';

export default Ember.Controller.extend({
  model: null,
  editing: false,

  queryParams: ['editing'],

  actions: {
    done() {
      this.transitionToRoute('settings.projects').then(() => {
        this.send('refreshKubernetes');
      });
    },

    cancel() {
      this.transitionToRoute('settings.projects');
    },
  },
});
