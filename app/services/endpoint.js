import Ember from 'ember';

export default Ember.Service.extend({
  absolute: function() {
    var url = this.get('app.endpoint');

    // If the URL is relative, add on the current base URL from the browser
    if ( url.indexOf('http') !== 0 )
    {
      url = window.location.origin + '/' + url.replace(/^\/+/,'');
    } 

    // URL must end in a single slash
    url = url.replace(/\/+$/,'') + '/';

    return url;
  }.property('app.endpoint'),

  host: function() {
    var a = document.createElement('a');
    a.href = this.get('absolute');
    return a.host;
  }.property('absolute')
});
