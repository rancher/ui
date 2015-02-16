import Cattle from 'ui/utils/cattle';

export default Cattle.CollectionController.extend({
  itemController: 'host',

  actions: {
    goToContainer: function(id) {
      this.transitionToRoute('container', id);
    }
  }
});
