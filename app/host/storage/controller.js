import Cattle from 'ui/utils/cattle';

export default Cattle.CollectionController.extend({
  nonRootVolumes: function() {
    return this.get('arrangedContent').filter(function(volume) {
      return !volume.get('instanceId') && volume.get('state') !== 'purged';
    });
  }.property('arrangedContent.@each.{instanceId,state}')
});
