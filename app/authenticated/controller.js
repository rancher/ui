import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  cookies: Ember.inject.service(),
  needs: ['application'],
  currentPath: Ember.computed.alias('controllers.application.currentPath'),

  error: null,

  projects: null,
  project: null,


  addAuthParams: function(url) {
    var token = this.get('cookies').get(C.COOKIE.TOKEN);
    if ( token )
    {
      url = Util.addQueryParam(url, 'token', token);
    }

    var projectId = this.get('session').get(C.SESSION.PROJECT);
    if ( projectId )
    {
      url = Util.addQueryParam(url, 'projectId', projectId);
    }

    return url;
  }
});
