import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    editConfig: function() {
      this.transitionToRoute('loadbalancerconfig.edit', this.get('config.id'));
    }
  }
});
