import Ember from 'ember';

var DRIVERS = [
  {route: 'hosts.new.digitalocean',   label: 'DigitalOcean',      available: false },
  {route: 'hosts.new.openstack',      label: 'OpenStack',         available: false },
  {route: 'hosts.new.custom',         label: 'Custom/Bare Metal', available: true  },
];

export default Ember.ObjectController.extend({
  needs: ['application'],
  lastRoute: DRIVERS.filter((driver) => { return driver.available; })[0].route,
  drivers: DRIVERS,

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
});
