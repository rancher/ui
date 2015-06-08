import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Mixin.create({
  type: 'user_or_org',
  login: null, // This can't be called id because Ember uses that property..
  size: 36,
  fallback: null,

  name: null,
  description: 'Loading...',
  org: null,

  _avatarUrl: null,


  isTeam: Ember.computed.equal('type','team'),

  loginOrTypeChanged: function() {
    var login = this.get('login');
    var type = this.get('type');
    var fallback = this.get('fallback');

    if ( !type || !login )
    {
      return;
    }

    this.setProperties({
      'name': login,
      'description': 'Loading...',
      '_avatarUrl': null,
    });

    this.get('github').find(type, login).then((entry) => {
      this.setProperties({
        name: entry.name,
        description: entry.description,
        _avatarUrl: entry.avatarUrl,
        org: entry.org,
      });
    }).catch((err) => {
      if ( fallback && this.get('type') === 'team' )
      {
        this.setProperties({
          name: "(A team you don't have access to)",
          org: fallback,
          _avatarUrl: null
        });
      }
      else
      {
        this.setProperties({
          name: login,
          description: 'Error: ' + err,
          org: null,
          _avatarUrl: null
        });
      }
    });
  }.observes('login','type','fallback').on('init'),

  baseUrl: function() {
    return 'https://' + (this.get('app.githubHostname')||'github.com') + '/';
  }.property('app.githubHostname'),

  avatarUrl: function(){
    var url = this.get('_avatarUrl');
    if ( url )
    {
      url = Util.addQueryParam(url, 's', this.get('size') * 2);
    }
    return url;
  }.property('_avatarUrl','size'),

  orgUrl: function() {
    var org = this.get('org');
    if ( org && this.get('type') === 'team' )
    {
      return this.get('baseUrl') + 'orgs/' + encodeURIComponent(org);
    }
  }.property('type','org'),

  url: function() {
    if ( this.get('type') === 'team' )
    {
      var entry = this.get('github').teamById(this.get('login'));
      if ( entry && entry.slug )
      {
        return this.get('baseUrl')+ 'orgs/' + encodeURIComponent(entry.org) + '/teams/' + encodeURIComponent(entry.slug);
      }
    }
    else
    {
      return this.get('baseUrl') + encodeURIComponent(this.get('login'));
    }
  }.property('login'),
});
