import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['application'],

  registrationUrl: function() {
    // http://a.b.c.d/v1/registrationTokens/blah, a.b.c.d is where the UI is running
    var url = this.get('links.registrationUrl');
    if ( !url )
    {
      return null;
    }

    // http://e.f.g.h/ , does not include version.  e.f.g.h is where the API actually is.
    var endpoint = this.get('controllers.application.absoluteEndpoint'); 

    url = url.replace(/https?:\/\/[^\/]+\/?/,endpoint);
    return url;
  }.property('links.registrationUrl','controllers.application.absoluteEndpoint'),

  registrationCommand: function() {
    if ( this.get('command') )
    {
      return this.get('command');
    }
    else
    {
      var url = this.get('registrationUrl');
      if ( url )
      {
        return `sudo docker run --rm -it --privileged -v /var/run/docker.sock:/var/run/docker.sock rancher/agent ${url}`;
      }
    }
  }.property('command','registrationUrl'),

});
