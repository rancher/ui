import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  cookies: Ember.inject.service(),
  'tab-session': Ember.inject.service('tab-session'),
  settings: Ember.inject.service(),

  absolute: function() {
    let setting = this.get(`settings.${C.SETTING.API_HOST}`);
    if ( setting && setting.indexOf('http') !== 0 ) {
      setting = 'http://' + setting;
    }

    let url = setting || this.get('app.apiServer');

    // If the URL is relative, add on the current base URL from the browser
    if ( url.indexOf('http') !== 0 )
    {
      url = window.location.origin + '/' + url.replace(/^\/+/,'');
    } 

    // URL must end in a single slash
    url = url.replace(/\/+$/,'') + '/';

    return url;
  }.property(`settings.${C.SETTING.API_HOST}`,'app.apiServer'),

  host: function() {
    var a = document.createElement('a');
    a.href = this.get('absolute');
    return a.host;
  }.property('absolute'),

  origin: function() {
    var a = document.createElement('a');
    a.href = this.get('absolute');
    return a.origin;
  }.property('absolute'),

  api: function() {
    // Strip trailing slash off of the absoluteEndpoint
    var base = this.get('absolute').replace(/\/+$/,'');
    // Add a single slash
    base += '/';

    var current = this.get('app.apiEndpoint').replace(/^\/+/,'');
    var legacy = this.get('app.legacyApiEndpoint').replace(/^\/+/,'');

    // Go to the project-specific version
    var projectId = this.get('tab-session').get(C.TABSESSION.PROJECT);
    var project = '';
    if ( projectId )
    {
      project = '/projects/' + projectId;
    }

    var authBase = window.location.origin + '/';

    return {
      auth: {
        account: {
          current: authBase + current,
          legacy:  authBase + legacy
        },
        environment: {
          current: authBase + current + project,
          legacy:  authBase + legacy + project
        }
      },
      display: {
        account: {
          current: base + current,
          legacy:  base + legacy
        },
        environment: {
          current: base + current + project,
          legacy:  base + legacy + project
        }
      },
    };
  }.property('absolute', 'app.{apiEndpoint,legacyApiEndpoint}', `tab-session.${C.TABSESSION.PROJECT}`),
});
