import Ember from 'ember';

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
  displayDescription: Ember.computed.alias('identity.displayDescription'),
});
