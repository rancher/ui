import Cattle from 'ui/utils/cattle';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

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

    // Go to the project-specific version
    var projectId = this.get('session').get(C.SESSION.PROJECT);
    if ( projectId )
    {
      url += '/projects/' + projectId;
    }

    return url;
  }.property('controllers.application.absoluteEndpoint','app.apiEndpoint','session.'+C.SESSION.PROJECT),

  endpointWithAuth: function() {
    var url = this.get('endpoint');

    if ( this.get('app.authenticationEnabled') )
    {
      url = Util.addAuthorization(url, C.HEADER.AUTH_FAKE_USER +'=' + this.get('session.'+C.SESSION.PROJECT), this.get('session.'+C.SESSION.TOKEN));
    }

    return url;
  }.property('endpoint', 'session.'+C.SESSION.TOKEN,'session.'+C.SESSION.PROJECT)
});
