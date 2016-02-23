import Ember from 'ember';

export default Ember.Controller.extend({
  model: null,
  editing: false,

  queryParams: ['editing'],

  actions: {
    cancel() {
      this.transitionTo('settings.projects.detail', this.get('model.project.id'), {queryParams: {editing: false}});
    },
  },
});
