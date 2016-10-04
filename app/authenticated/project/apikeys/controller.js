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
  modalService: Ember.inject.service('modal'),

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
      var cred;
      if ( kind === 'account' )
      {
        cred = this.get('userStore').createRecord({
          type: 'apikey',
          accountId: this.get(`session.${C.SESSION.ACCOUNT_ID}`),
        });
      }
      else
      {
        cred = this.get('store').createRecord({
          type: 'apikey',
          accountId: this.get('projects.current.id'),
        });
      }

      this.get('modalService').toggleModal('edit-apikey', cred);
    },
  },

  endpoint: function() {
    // Strip trailing slash off of the absoluteEndpoint
    var base = this.get('endpointService.absolute').replace(/\/+$/,'');
    // Add a single slash
    base += '/';

    var current = this.get('app.apiEndpoint').replace(/^\/+/,'');
    var legacy = this.get('app.legacyApiEndpoint').replace(/^\/+/,'');

    // Go to the project-specific version
    var projectId = this.get('tab-session').get(C.TABSESSION.PROJECT);
    var project = '';
    if ( projectId )
    {
      project = '/projects/' + projectId;
    }

    // For local development where API doesn't match origin, add basic auth token
    var authBase = base;
    if ( base.indexOf(window.location.origin) !== 0 )
    {
      var token = this.get('cookies').get(C.COOKIE.TOKEN);
      if ( token ) {
        authBase = Util.addAuthorization(base, C.USER.BASIC_BEARER, token);
      }
    }

    return {
      auth: {
        account: {
          current: authBase + current,
          legacy:  authBase + legacy
        },
        environment: {
          current: authBase + current + project,
          legacy:  authBase + legacy + project
        }
      },
      display: {
        account: {
          current: base + current,
          legacy:  base + legacy
        },
        environment: {
          current: base + current + project,
          legacy:  base + legacy + project
        }
      },
    };
  }.property('endpointService.absolute', 'app.{apiEndpoint,legacyApiEndpoint}', `tab-session.${C.TABSESSION.PROJECT}`),
});
