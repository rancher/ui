import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

export default Ember.Object.extend({
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
    return (this.get('session.teams')||[]).filterProperty('id', id)[0];
  },

  request: function(url) {
    var headers = {};
    var session = this.get('session');

    var authValue = session.get(C.SESSION.TOKEN);
    if ( authValue )
    {
      headers[C.HEADER.AUTH] = C.HEADER.AUTH_TYPE + ' ' + authValue;
    }

    return ajaxPromise({url: url, headers: headers, dataType: 'json'}, true).catch((obj) => {
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

    var url = Util.addQueryParams('https://' + (this.get('app.githubHostname') || C.GITHUB.DEFAULT_HOSTNAME) + C.GITHUB.AUTH_PATH, {
      client_id: this.get('app.githubClientId'),
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

  login: function(code) {
    var session = this.get('session');

    var headers = {};
    headers[C.HEADER.AUTH] = undefined; // Explictly not send auth
    headers[C.HEADER.PROJECT] = undefined; // Explictly not send project

    return this.get('store').rawRequest({
      url: 'token',
      method: 'POST',
      headers: headers,
      data: {
        code: code
      },
    }).then(function(res) {
      var auth = JSON.parse(res.xhr.responseText);
      var interesting = {};
      C.TOKEN_TO_SESSION_KEYS.forEach((key) => {
        if ( typeof auth[key] !== 'undefined' )
        {
          interesting[key] = auth[key];
        }
      });

      interesting[C.SESSION.LOGGED_IN] = true;
      session.setProperties(interesting);
      return res;
    }).catch((res) => {
      var err = JSON.parse(res.xhr.responseText);
      return Ember.RSVP.reject(err);
    });
  },

  clearSessionKeys: function() {
    var values = {};
    C.TOKEN_TO_SESSION_KEYS.forEach((key) => {
      values[key] = undefined;
    });

    values[C.SESSION.LOGGED_IN] = false;
    this.get('session').setProperties(values);
  },
});
