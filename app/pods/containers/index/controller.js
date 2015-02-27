import Cattle from 'ui/utils/cattle';

export default Cattle.CollectionController.extend({
  actions: {
    newContainer: function() {
      this.transitionToRoute('containers.new');
    }
  }
});
