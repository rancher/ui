import Cattle from 'ui/utils/cattle';

export default Cattle.CollectionController.extend({
  dot: false,
  queryParams: ['dot'],
  itemController: 'host',

  actions: {
    goToContainer: function(id) {
      this.transitionToRoute('container', id);
    }
  }
});
