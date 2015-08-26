import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

export default Ember.Service.extend({
  cookies: Ember.inject.service(),
  session: Ember.inject.service(),

  // Set by app/services/access
  hostname: null,
  clientId: null,

  find: function(type, id) {
    if ( type === 'team' )
    {
      var entry = this.teamById(id);
      if ( entry )
      {
        return Ember.RSVP.resolve(Ember.Object.create({
          id: id,
          name: entry.name,
          type: 'team',
          org: entry.org,
          avatarUrl: null,
        }));
      }
      else
      {
        return Ember.RSVP.reject('Team ' + id + ' not found');
      }
    }

    var cached = this.getCache(id);
    if ( cached )
    {
      return Ember.RSVP.resolve(cached);
    }

    var url = C.GITHUB.PROXY_URL + 'users/' + id;
    return this.request(url).then((body) => {
      var out = Ember.Object.create({
        id: body.login,
        name: body.login,
        type: (body.type === 'User' ? 'user' : 'org'),
        description: body.name,
        avatarUrl: body.avatar_url,
      });

      this.setCache(id,out);
      return out;
    });
  },

  getCache: function(id) {
    var cache = this.get('session').get(C.SESSION.GITHUB_CACHE)||{};
    var entry = cache[id];
    if ( entry )
    {
      return Ember.Object.create(entry);
    }
  },

  setCache: function(id, value) {
    var session = this.get('session');
    var cache = session.get(C.SESSION.GITHUB_CACHE)||{};
    cache[id] = value;

    // Sub-keys don't get automatically persisted to the session...
    session.set(C.SESSION.GITHUB_CACHE, cache);
  },

  clearCache: function() {
    this.get('session').set(C.SESSION.GITHUB_CACHE, {});
  },

  teamById: function(id) {
    return (this.get('session.teams')||[]).filterBy('id', id)[0];
  },

  request: function(url) {
    return ajaxPromise({url: url, dataType: 'json'}, true).catch((obj) => {
      if ( obj.xhr.status === 401 )
      {
        this.send('logout',null,true);
      }
    });
  },

  generateState: function() {
    var state = Math.random()+'';
    this.get('session').set('githubState', state);
    return state;
  },

  stateMatches: function(actual) {
    var expected = this.get('session.githubState');
    return actual && expected === actual;
  },

  getAuthorizeUrl: function(test) {
    var redirect = this.get('session').get(C.SESSION.BACK_TO) || window.location.href;

    if ( test )
    {
      redirect = Util.addQueryParam(redirect, 'isTest', 1);
    }

    var url = Util.addQueryParams('https://' + (this.get('hostname') || C.GITHUB.DEFAULT_HOSTNAME) + C.GITHUB.AUTH_PATH, {
      client_id: this.get('clientId'),
      state: this.generateState(),
      scope: C.GITHUB.SCOPE,
      redirect_uri: redirect
    });

    return url;
  },

  authorizeRedirect: function() {
    window.location.href = this.getAuthorizeUrl();
  },

  authorizeTest: function(cb) {
    var responded = false;
    window.onGithubTest = function(err,code) {
      if ( !responded )
      {
        responded = true;
        cb(err,code);
      }
    };

    var popup = window.open(this.getAuthorizeUrl(true), 'rancherAuth', Util.popupWindowOptions());
    popup.onBeforeUnload = function() {
      if( !responded )
      {
        responded = true;
        cb('Github access was not authorized');
      }
    };
  },
});
