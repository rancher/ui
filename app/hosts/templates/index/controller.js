import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    launch(model) {
      this.transitionToRoute('hosts.templates.launch', model.id);
    },
  },

  sorting: ['driver','name'],
  arranged: Ember.computed.sort('model','sorting'),
});
