import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  error: null,

  activeTab: '',
  pageName: '',
  backRoute: null,
  backPrevious: null,
  addRoute: null,
  addParams: null,
  hasAside: false,
  asideColor: '',

  projects: null,
  project: null,

  addAuthParams: function(url) {
    var session = this.get('session');
    var token = session.get(C.SESSION.TOKEN);
    if ( token )
    {
      url = Util.addQueryParam(url, 'token', token);
    }

    var projectId = session.get(C.SESSION.PROJECT);
    if ( projectId )
    {
      url = Util.addQueryParam(url, 'projectId', projectId);
    }

    return url;
  }
});
