import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  nonRootVolumes: function() {
    return this.get('model').filter(function(volume) {
      return !volume.get('instanceId') && volume.get('state') !== 'purged';
    });
  }.property('model.@each.{instanceId,state}'),

  sortableContent: Ember.computed.alias('nonRootVolumes'),
  sortBy: 'name',
  sorts: {
    state:    ['stateSort','displayUri','id'],
    hostPath: ['displayUri','id'],
  },
});
