import Cattle from 'ui/utils/cattle';

export default Cattle.LegacyCollectionController.extend({
  actions: {
    newContainer: function() {
      this.transitionToRoute('containers.new');
    }
  }
});
