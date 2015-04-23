import Cattle from 'ui/utils/cattle';
import C from 'ui/utils/constants';

export default Cattle.CollectionController.extend({
  needs: ['application','authenticated'],
  itemController: 'apikey',
  endpoint: function() {
    // Strip trailing slash off of the absoluteEndpoint
    var url = this.get('controllers.application.absoluteEndpoint').replace(/\/+$/,'');
    // Add a single slash
    url += '/';

    // And strip leading slashes off the API endpoint
    url += this.get('app.apiEndpoint').replace(/^\/+/,'');

    return url;
  }.property('controllers.application.absoluteEndpoint','app.apiEndpoint'),

  endpointWithAuth: function() {
    var session = this.get('session');
    var endpoint = this.get('endpoint');
    var pos = endpoint.indexOf('//');

    endpoint = endpoint.substr(0,pos+2) +
               'x-api-bearer=' + session.get(C.SESSION.PROJECT) +
               ':' + session.get(C.SESSION.TOKEN) +
               '@' + endpoint.substr(pos+2);

    return endpoint;
  }.property('endpoint', 'session.'+C.SESSION.TOKEN,'session.'+C.SESSION.PROJECT)
});
