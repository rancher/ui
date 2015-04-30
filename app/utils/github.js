import Ember from 'ember';
import C from 'ui/utils/constants';

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

    return new Ember.RSVP.Promise(function(resolve,reject) {
      Ember.$.ajax({url: url, headers: headers, dataType: 'json'}).then(success,fail);

      function success(body, textStatus, xhr) {
        Ember.run(function() {
          resolve(body,'AJAX Reponse: '+url + '(' + xhr.status + ')');
        });
      }

      function fail(xhr, textStatus, err) {
        Ember.run(function() {
          reject({xhr: xhr, textStatus: textStatus, err: err}, 'AJAX Error:' + url + '(' + xhr.status + ')');
        });
      }
    },'Raw AJAX Request: '+url);
  },
});
