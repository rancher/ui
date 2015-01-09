import Cattle from 'ui/utils/cattle';

export default Cattle.CollectionController.extend({
  needs: ['application'],
  itemController: 'apikey',
  endpoint: function() {
    // Strip trailing slash off of the absoluteEndpoint
    var url = this.get('controllers.application.absoluteEndpoint').replace(/\/+$/,'');
    // Add a single slash
    url += '/';

    // And strip leading slashes off the API endpoint
    url += this.get('app.apiEndpoint').replace(/^\/+/,'');

    return url;
  }.property('controllers.application.absoluteEndpoint','app.apiEndpoint')
});
