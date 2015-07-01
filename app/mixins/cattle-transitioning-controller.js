import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

function proxyToModel(methodName) {
  return function(/*arguments*/) {
    var model = this.get('model');
    return model[methodName].apply(model,arguments);
  };
}

export default Ember.Mixin.create({
  needs: ['application'],

  actions: {
    promptDelete: function() {
      this.get('controllers.application').set('confirmDeleteResources', [ this.get('model') ] );
    },

    delete: function() {
      return this.delete();
    },

    restore: function() {
      return this.doAction('restore');
    },

    purge: function() {
      return this.doAction('purge');
    },

    goToApi: function() {
      var url = this.get('links.self'); // http://a.b.c.d/v1/things/id, a.b.c.d is where the UI is running
      var endpoint = this.get('endpoint.absolute'); // http://e.f.g.h/ , does not include version.  e.f.g.h is where the API actually is.
      url = url.replace(/https?:\/\/[^\/]+\/?/,endpoint);

      // Go to the project-specific version
      var projectId = this.get('session').get(C.SESSION.PROJECT);
      if ( projectId )
      {
        url = url.replace(/(.*?\/v1)(.*)/,"$1/projects/"+projectId+"$2");
      }

      // For local development where API doesn't match origin, add basic auth token
      if ( url.indexOf(window.location.origin) !== 0 )
      {
        var token = this.get('cookies').get(C.COOKIE.TOKEN);
        if ( token )
        {
          url = Util.addAuthorization(url, C.USER.BASIC_BEARER, token);
        }
      }

      window.open(url, '_blank');
    },
  },

  hasAction:  proxyToModel('hasAction'),
  doAction:   proxyToModel('doAction'),
  linkFor:    proxyToModel('linkFor'),
  hasLink:    proxyToModel('hasLink'),
  importLink: proxyToModel('importLink'),
  followLink: proxyToModel('followLink'),
  save:       proxyToModel('save'),
  delete:     proxyToModel('delete'),
  reload:     proxyToModel('reload'),
  isInStore:  proxyToModel('isInStore'),
});
