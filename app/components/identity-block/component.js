import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  // Identity or externalId+externalIdType
  identity          : null,
  externalIdType    : null,
  externalId        : null,
  identityNotParsed : null,

  avatar            : true,
  link              : true,
  size              : 35,

  loading           : false,

  init() {
    this._super(...arguments);

    var eType = this.get('externalIdType');
    var eId = this.get('externalId');
    var id = this.get('identityNotParsed');

    if ( !id && eType && eId ) {
     id =`1i!${eType}:${eId}`;
    }

    if ( !this.get('identity') )
    {
      if ( id )
      {
        this.set('loading', true);
        this.get('userStore').find('identity', id).then((identity) => {
          if ( this.isDestroyed || this.isDestroying ) {
            return;
          }

          this.set('identity', identity);
        }).catch((/*err*/) => {
          // Do something..
        }).finally(() => {
          if ( this.isDestroyed || this.isDestroying ) {
            return;
          }

          this.set('loading', false);
        });
      }
    }
  },

  classNames: ['gh-block'],
  attributeBindings: ['aria-label:identity.name'],

  avatarSrc: Ember.computed.alias('identity.profilePicture'),
  url: Ember.computed.alias('identity.profileUrl'),
  login: Ember.computed.alias('identity.login'),

  displayDescription: function() {
    var out;
    var name = this.get('identity.name');
    if ( this.get('identity.externalIdType') === C.PROJECT.TYPE_GITHUB_TEAM )
    {
      out = name.replace(/:.*/,'') + ' team';
    }
    else
    {
      if (name) {
        out = name;
      } else {
        out = this.get('identity.externalId');
      }
    }
    return out;
  }.property('identity.{externalIdType,name,externalId}'),
});
