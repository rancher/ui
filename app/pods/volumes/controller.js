import Cattle from 'ui/utils/cattle';

export default Cattle.CollectionController.extend({
  itemController: 'volume',
  nonRootVolumes: function() {
    return this.get('arrangedContent').filter(function(volume) {
      return !volume.get('instanceId');
    });
  }.property('arrangedContent.[]')
});
