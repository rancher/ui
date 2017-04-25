import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  cookies: Ember.inject.service(),
  'tab-session': Ember.inject.service('tab-session'),
  settings: Ember.inject.service(),

  absolute: function() {
    var url = this.get('app.apiServer');

    // If the URL is relative, add on the current base URL from the browser
    if ( url.indexOf('http') !== 0 )
    {
      url = window.location.origin + '/' + url.replace(/^\/+/,'');
    } 

    // URL must end in a single slash
    url = url.replace(/\/+$/,'') + '/';

    return url;
  }.property('app.apiServer'),

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

  swarm: function() {
    var port = this.get(`settings.${C.SETTING.SWARM_PORT}`);
    if ( !port ) {
      port = parseInt(window.location.port,10);
    }

    if ( !port ) {
      port = ( window.location.protocol === 'https:' ? 443 : 80 );
    }

    return `tcp://${window.location.hostname}:${port}`;
  }.property(`settings.${C.SETTING.SWARM_PORT}`)
});
