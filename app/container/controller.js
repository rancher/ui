import Ember from 'ember';

const {computed, get} = Ember;

export default Ember.Controller.extend({
  actions: {
    changeContainer(container) {
      this.transitionToRoute('container', container.get('id'));
    }
  },

  stackName: computed('model.labels', function() {
    return get(this, 'model.labels')['io.rancher.stack.name'];
  }),
});
