import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  actions: {
    launch(model) {
      this.transitionToRoute('hosts.templates.launch', model.id);
    },
  },
  filteredContent: Ember.computed('', function() {
    return this.get('model.content');
  }),
});
