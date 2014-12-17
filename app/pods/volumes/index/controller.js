import Cattle from '../../../utils/cattle';

export default Cattle.CollectionController.extend({
  itemController: 'volume',
  nonRootVolumes: function() {
    return this.get('notPurged').filter(function(volume) {
      return !volume.get('instanceId');
    });
  }.property('notPurged.[]')
});
