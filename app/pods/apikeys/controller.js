import Cattle from 'ui/utils/cattle';

export default Cattle.CollectionController.extend({
  needs: ['application'],
  itemController: 'apikey',
  endpoint: function() {
    return this.get('controllers.application.absoluteEndpoint').replace(/\/+$/,'') + this.get('app.apiEndpoint');
  }.property('controllers.application.absoluteEndpoint','app.apiEndpoint')
});
