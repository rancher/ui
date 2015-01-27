import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['application'],

  registrationUrl: function() {
    var url = this.get('links.registrationUrl'); // http://a.b.c.d/v1/things/id, a.b.c.d is where the UI is running
    if ( !url )
    {
      return null;
    }

    var endpoint = this.get('controllers.application.absoluteEndpoint'); // http://e.f.g.h/ , does not include version.  e.f.g.h is where the API actually is.
    url = url.replace(/https?:\/\/[^\/]+\/?/,endpoint);
    return url;
  }.property('links.registrationUrl','controllers.application.absoluteEndpoint'),
});
