import Ember from 'ember';

export default Ember.Component.extend({
  type: 'user',
  login: null,

  classNames: ['gh-avatar'],
  name: 'Loading...',
  avatarUrl: null,

  nameChanged: function() {
    var self = this;
    var url = 'https://api.github.com/' + this.get('type') + 's/' + this.get('login') + '?s=40';

    Ember.$.ajax({url: url, dataType: 'json'}).then(function(body) {
      self.set('name', body.name);
      self.set('avatarUrl', body.avatar_url);
    }, function() {
      var type = self.get('type');
      type = type.substr(0,1).toUpperCase() + type.substr(1);

      self.set('name', 'Warning: ' + type + ' not found');
    });
  }.observes('login','type').on('init'),

  url: function() {
    return 'https://github.com/'+ encodeURIComponent(this.get('login'));
  }.property('login'),
});
