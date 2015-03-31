import Cattle from 'ui/utils/cattle';

export default Cattle.CollectionController.extend({
  itemController: 'registry',
  sortProperties: ['name','serverAddress','id'],
});
