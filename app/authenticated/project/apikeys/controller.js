import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  access: Ember.inject.service(),
  'tab-session': Ember.inject.service(),

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

  accountArranged: function() {
    var me = this.get(`session.${C.SESSION.ACCOUNT_ID}`);
    return this.get('arranged').filter((row) => {
      return row.get('accountId') === me;
    });
  }.property('arranged.@each.accountId'),

  environmentArranged: function() {
    var me = this.get(`session.${C.SESSION.ACCOUNT_ID}`);
    return this.get('arranged').filter((row) => {
      return row.get('accountId') !== me;
    });
  }.property('arranged.@each.accountId'),

  actions: {
    newApikey: function(kind) {
      var cred = this.get('store').createRecord({type:'apikey'});
      if ( kind === 'account' )
      {
        cred.set('accountId', this.get(`session.${C.SESSION.ACCOUNT_ID}`));
      }

      this.get('application').setProperties({
        editApikey: true,
        originalModel: cred,
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

    return url;
  }.property('endpointService.absolute','app.apiEndpoint',`tab-session.${C.TABSESSION.PROJECT}`),

  displayEndpointEnvironment: function() {
    var url = this.get('displayEndpoint');

    // Go to the project-specific version
    var projectId = this.get('tab-session').get(C.TABSESSION.PROJECT);
    if ( projectId )
    {
      url += '/projects/' + projectId;
    }

    return url;
  }.property('displayEndpoint'),

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
  }.property('displayEndpoint', `session.${C.SESSION.TOKEN}`,`tab-session.${C.TABSESSION.PROJECT}`),

  endpointWithAuthEnvironment: function() {
    var url = this.get('displayEndpointEnvironment');

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
  }.property('displayEndpointEnvironment', `session.${C.SESSION.TOKEN}`,`tab-session.${C.TABSESSION.PROJECT}`)
});
