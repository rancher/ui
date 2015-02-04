import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  type: 'user',
  login: null,
  size: 40,

  name: null,
  description: 'Loading...',
  _avatarUrl: null,

  loginOrTypeChanged: function() {
    var self = this;
    var session = this.get('session');

    var cache = session.get('avatarCache')||{};
    var login = this.get('login');
    var type = this.get('type');
    var key = type + ':' + login;

    if ( !type || !login )
    {
      return;
    }

    // Teams can't be looked up without auth...
    if ( type === 'team' )
    {
      var entry = (session.get('teams')||[]).filterProperty('name', login)[0];
      this.set('_avatarUrl', null);
      if ( entry )
      {
        this.set('name', entry.name);
        this.set('description', entry.org + ' team');
      }
      else
      {
        this.set('name', '('+ login + ')');
        this.set('description', '(Unknown team id)');
      }

      return;
    }

    this.set('name', login);


    if ( cache[key] )
    {
      gotInfo(cache[key]);
    }
    else
    {
      var url = C.GITHUB_API_URL + type + 's/' + login;
      Ember.$.ajax({url: url, dataType: 'json'}).then((body) => {
        cache[key] = body;

        // Sub-keys don't get automatically persisted to the session...
       session.set('avatarCache', cache);

        gotInfo(body);
      }, () => {
        this.sendAction('notFound', login);
      });
    }

    function gotInfo(body)
    {
      self.set('description', body.name);
      self.set('_avatarUrl', body.avatar_url);
    }
  }.observes('login','type').on('init'),

  avatarUrl: function(){
    var url = this.get('_avatarUrl');
    if ( url )
    {
      url += (url.indexOf('?') >= 0 ? '&' : '?') + 's=' + this.get('size');
    }
    return url;
  }.property('_avatarUrl','size'),

  url: function() {
    return C.GITHUB_URL + encodeURIComponent(this.get('login'));
  }.property('login'),
});
