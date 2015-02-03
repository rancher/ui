import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  type: 'user',
  login: null,
  size: 40,

  name: 'Loading...',
  _avatarUrl: null,

  loginOrTypeChanged: function() {
    var self = this;

    var cache = self.get('session').get('avatarCache')||{};

    var login = this.get('login');
    if ( !login )
    {
      return;
    }

    var type = this.get('type');
    var key = type + ':' + login;

    if ( cache[key] )
    {
      gotInfo(cache[key]);
    }
    else
    {
      var url = C.GITHUB_API_URL + type + 's/' + login;
      Ember.$.ajax({url: url, dataType: 'json'}).then(function(body) {
        cache[key] = body;

        // Sub-keys don't get automatically persisted to the session...
        self.get('session').set('avatarCache', cache);

        gotInfo(body);
      }, function() {
        self.sendAction('notFound', login);
      });
    }

    function gotInfo(body)
    {
      self.set('name', body.name);
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
