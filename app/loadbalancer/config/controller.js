import Ember from 'ember';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';

export default Ember.ObjectController.extend({
  actions: {
    editConfig: function() {
      this.transitionToRoute('loadbalancerconfig.edit', this.get('config.id'));
    }
  },

  unremovedListeners: function() {
    return UnremovedArrayProxy.create({
      sourceContent: this.get('listeners'),
    });
  }.property('listeners'),
});
