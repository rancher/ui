import Ember from 'ember';

export default Ember.Component.extend({
  identity: null,
  link: true,
  size: 35,

  classNames: ['gh-avatar'],
  attributeBindings: ['aria-label:identity.name'],

  avatarSrc: Ember.computed.alias('identity.avatarSrc'),
  url: Ember.computed.alias('identity.profileUrl'),
});
