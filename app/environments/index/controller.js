import Cattle from 'ui/utils/cattle';

export default Cattle.LegacyCollectionController.extend({
  itemController: 'environment',
  sortProperties: ['name','id'],
});
