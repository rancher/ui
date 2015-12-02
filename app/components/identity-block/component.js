import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  // Identity or externalId+externalIdType
  identity: null,
  externalIdType: null,
  externalId: null,
  identityNotParsed: null,

  avatar: true,
  link: true,
  size: 35,

  loading: false,
  didInitAttrs: function() {
    var type = this.get('externalIdType');
    var id = this.get('externalId');
    var identityOut = this.get('identityNotParsed') || `1i${type}:${id}`;

    if ( !this.get('identity') )
    {
      this.set('loading', true);
      this.get('store').find('identity',identityOut).then((identity) => {
        if (this._state !== 'destroying') {
          this.set('identity', identity);
        }
      }).catch((/*err*/) => {
        // Do something..
      }).finally(() => {
        if (this._state !== 'destroying') {
          this.set('loading', false);
        }
      });
    }
  },

  classNames: ['gh-block'],
  attributeBindings: ['aria-label:identity.name'],

  avatarSrc: Ember.computed.alias('identity.avatarSrc'),
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
