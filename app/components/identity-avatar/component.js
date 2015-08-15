import Ember from 'ember';

export default Ember.Component.extend({
  identity: null,
  link: true,
  size: 36,

  classNames: ['gh-avatar'],
  attributeBindings: ['aria-label:identity.name'],

  avatarUrl: Ember.computed.alias('identity.profilePicture'),
  url: Ember.computed.alias('identity.profileUrl'),
});
