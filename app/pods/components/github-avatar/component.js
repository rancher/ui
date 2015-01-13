import Ember from 'ember';

export default Ember.Component.extend({
  type: 'user',
  login: null,

  classNames: ['gh-avatar'],
  name: 'Checking...',
  avatarUrl: null,

  nameChanged: function() {
    var self = this;
    var login = this.get('login');
    var type = this.get('type');
    var url = 'https://api.github.com/' + type + 's/' + login;

    Ember.$.ajax({url: url, dataType: 'json'}).then(function(body) {
      self.set('name', body.name);

      var avatarUrl = body.avatar_url;
      avatarUrl += (avatarUrl.indexOf('?') >= 0 ? '&' : '?') + 's=40';
      self.set('avatarUrl', avatarUrl);
    }, function() {
      self.set('name', '(Not found)');
      self.sendAction('notFound', login);
    });
  }.observes('login','type').on('init'),

  url: function() {
    return 'https://github.com/'+ encodeURIComponent(this.get('login'));
  }.property('login'),
});
