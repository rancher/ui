import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Object.extend({
  find: function(type, id) {
    var session = window.l('session:main');
    var cache = session.get('githubCache')||{};

    if ( type === 'team' )
    {
      var entry = (session.get('teams')||[]).filterProperty('id', id)[0];
      if ( entry )
      {
        return Ember.RSVP.resolve(Ember.Object.create({
          id: id,
          name: entry.name,
          type: 'team',
          description: entry.org + ' team',
          avatarUrl: null,
        }));
      }
      else
      {
        return Ember.RSVP.resolve(Ember.Object.create({
          id: id,
          name: '(' + id + ')',
          type: 'team',
          description: '(Unknown team)',
          avatarUrl: null
        }));
      }
    }
    else
    {
      type = 'user_or_org';
    }

    var key = type +':'+ id;
    if ( cache[id] )
    {
      return Ember.RSVP.resolve(cache[id]);
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

      cache[key] = out;

      // Sub-keys don't get automatically persisted to the session...
      session.set('githubCache', cache);

      return out;
    });
  },

  request: function(url) {
    var headers = {};
    var session = window.l('session:main');

    var authValue = session.get(C.SESSION.TOKEN);
    if ( authValue )
    {
      headers[C.HEADER.AUTH] = C.HEADER.AUTH_TYPE + ' ' + authValue;
    }

    return new Ember.RSVP.Promise(function(resolve,reject) {
      Ember.$.ajax({url: url, headers: headers, dataType: 'json'}).then(success,fail);

      function success(body, textStatus, xhr) {
        Ember.run(function() {
          // @TODO GitHub proxy doesn't return correct status code: #575
          if ( body && body.id )
          {
            resolve(body,'AJAX Reponse: '+url + '(' + xhr.status + ')');
          }
          else
          {
            reject({xhr: xhr, textStatus: textStatus, err: 'Not Found'}, 'AJAX Error:' + url + '(' + xhr.status + ')');
          }
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
