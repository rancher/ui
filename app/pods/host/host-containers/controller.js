import Ember from 'ember';
import UnmanagedProxy from 'ui/utils/unmanaged-array-proxy';

export default Ember.ObjectController.extend({
  actions: {
    newContainer: function() {
      this.transitionToRoute('containers.new', {queryParams: {hostId: this.get('id')}});
    },
  },

  unmanagedInstances: function() {
    return UnmanagedProxy.create({
      sortProperties: ['name','id'],
      sourceContent: this.get('instances')
    });
  }.property()
});
