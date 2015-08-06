import Ember from 'ember';

export default Ember.Component.extend({
  identity: null,
  externalId: null,
  avatar: true,
  link: true,
  size: 36,

  externalIdChanged: function() {
    var id = this.get('externalId');
    if ( id )
    {
      this.set('loading', true);
      this.get('store').find('identity', null, {filter: {externalId: id}}).then((entries) => {
        this.set('identity', entries.objectAt(0));
      }).catch((err) => {
        this.set('error', err);
      }).finally(() => {
        this.set('loading', false);
      });
    }
  }.observes('externalId').on('init'),

  classNames: ['gh-block'],
  attributeBindings: ['aria-label:identity.name'],

  error: null,
  loading: false,
  avatarUrl: Ember.computed.alias('identity.profilePicture'),
  url: Ember.computed.alias('identity.profileUrl'),
  login: function() {
    //Ember.computed.alias('identity.login'),
    return this.get('identity.login') || this.get('identity.name');
  }.property('identity.{login,name}'),
  name: Ember.computed.alias('identity.name'),
});
