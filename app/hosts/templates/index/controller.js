import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    launch(model) {
      this.transitionToRoute('hosts.templates.launch', model.id);
    },
  },
  filteredContent: Ember.computed('model', function() {
    return this.get('model.content').sortBy('driver', 'name');
  }),
});
