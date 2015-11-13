import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    description:  ['description','name','id'],
    publicValue:  ['publicValue','id'],
    created:      ['created','name','id'],
  },

  application: Ember.inject.controller(),
  cookies: Ember.inject.service(),
  projects: Ember.inject.service(),
  growl: Ember.inject.service(),
  project: Ember.computed.alias('projects.current'),
  endpointService: Ember.inject.service('endpoint'),

  actions: {
    newApikey: function() {
      var cred = this.get('store').createRecord({type:'apikey'});
      cred.save().then((newCred) => {
        this.get('application').setProperties({
          editApikey: true,
          editApikeyIsNew: true,
          // Send a clone so that the secret isn't lost when the credential change event -> active comes in
          originalModel: newCred.clone(),
        });
      }).catch((err) => {
        this.get('growl').fromError('Error creating key',err);
      });
    },
  },

  displayEndpoint: function() {
    // Strip trailing slash off of the absoluteEndpoint
    var url = this.get('endpointService.absolute').replace(/\/+$/,'');
    // Add a single slash
    url += '/';

    // And strip leading slashes off the API endpoint
    url += this.get('app.apiEndpoint').replace(/^\/+/,'');

    // Go to the project-specific version
    var projectId = this.get('session').get(C.SESSION.PROJECT);
    if ( projectId )
    {
      url += '/projects/' + projectId;
    }

    return url;
  }.property('endpointService.absolute','app.apiEndpoint','session.'+C.SESSION.PROJECT),

  endpointWithAuth: function() {
    var url = this.get('displayEndpoint');

    // For local development where API doesn't match origin, add basic auth token
    if ( url.indexOf(window.location.origin) !== 0 )
    {
      var token = this.get('cookies').get(C.COOKIE.TOKEN);
      if ( token )
      {
        url = Util.addAuthorization(url, C.USER.BASIC_BEARER, token);
      }
    }

    return url;
  }.property('displayEndpoint', 'session.'+C.SESSION.TOKEN,'session.'+C.SESSION.PROJECT)
});
