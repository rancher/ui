import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { computed } from '@ember/object';

export default Service.extend({
  'tab-session': service('tab-session'),
  settings:      service(),
  app:           service(),

  absolute: computed(`settings.${ C.SETTING.API_HOST }`, 'app.apiServer', function() {
    let setting = this.get(`settings.${ C.SETTING.API_HOST }`);

    if ( setting && setting.indexOf('http') !== 0 ) {
      setting = `http://${  setting }`;
    }

    let url = setting || this.get('app.apiServer');

    // If the URL is relative, add on the current base URL from the browser
    if ( url.indexOf('http') !== 0 ) {
      url = `${ window.location.origin  }/${  url.replace(/^\/+/, '') }`;
    }

    // URL must end in a single slash
    url = `${ url.replace(/\/+$/, '')  }/`;

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

  api: computed('absolute', 'app.{apiEndpoint}', function() {
    // Strip trailing slash off of the absoluteEndpoint
    var base = this.get('absolute').replace(/\/+$/, '');

    // Add a single slash
    base += '/';

    var current = this.get('app.apiEndpoint').replace(/^\/+/, '');

    var authBase = `${ window.location.origin  }/`;

    return {
      auth:    { current: authBase + current, },
      display: { current: base + current, },
    };
  }),
});
