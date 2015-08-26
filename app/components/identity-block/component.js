import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  identity: null,
  avatar: true,
  link: true,
  size: 36,

  classNames: ['gh-block'],
  attributeBindings: ['aria-label:identity.name'],

  avatarUrl: Ember.computed.alias('identity.profilePicture'),
  url: Ember.computed.alias('identity.profileUrl'),
  login: Ember.computed.alias('identity.login'),

  displayDescription: function() {
    var name = this.get('identity.name');
    if ( this.get('identity.externalIdType') === C.PROJECT.TYPE_GITHUB_TEAM )
    {
      return name.replace(/:.*/,'') + ' team';
    }
    else
    {
      return name;
    }
  }.property('identity.{externalIdType,name}'),
});
