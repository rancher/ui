import Ember from 'ember';

export default Ember.Controller.extend({
  model: null,
  editing: false,
  tab: 'access',

  queryParams: ['editing','tab'],

  actions: {
    done() {
      this.transitionToRoute('settings.projects');
    },

    cancel() {
      this.transitionToRoute('settings.projects');
    },
  },
});
