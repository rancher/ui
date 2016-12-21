import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    changeContainer(container) {
      this.transitionToRoute('container', container.get('id'));
    }
  },
});
