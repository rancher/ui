import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { computed } from '@ember/object';

export default Service.extend({
  cookies: service(),
  'tab-session': service('tab-session'),
  settings: service(),

  absolute: computed(`settings.${C.SETTING.API_HOST}`, 'app.apiServer', function() {
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
  }),

  host: computed('absolute', function() {
    var a = document.createElement('a');
    a.href = this.get('absolute');
    return a.host;
  }),

  origin: computed('absolute', function() {
    var a = document.createElement('a');
    a.href = this.get('absolute');
    return a.origin;
  }),

  api: computed('absolute', 'app.{apiEndpoint,legacyApiEndpoint}', `cookies.${C.COOKIE.PROJECT}`, function() {
    // Strip trailing slash off of the absoluteEndpoint
    var base = this.get('absolute').replace(/\/+$/,'');
    // Add a single slash
    base += '/';

    var current = this.get('app.apiEndpoint').replace(/^\/+/,'');
    var legacy = this.get('app.legacyApiEndpoint').replace(/^\/+/,'');

    // Go to the project-specific version
    var projectId = this.get('cookies').get(C.COOKIE.PROJECT);
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
        project: {
          current: authBase + current + project,
          legacy:  authBase + legacy + project
        }
      },
      display: {
        account: {
          current: base + current,
          legacy:  base + legacy
        },
        project: {
          current: base + current + project,
          legacy:  base + legacy + project
        }
      },
    };
  }),
});
