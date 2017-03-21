import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),

  actions: {
    changeContainer(container) {
      this.transitionToRoute('container', container.get('id'));
    }
  },
});
