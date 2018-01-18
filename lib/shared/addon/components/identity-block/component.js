import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';
import { inject as service } from '@ember/service';

let notFound={};

export default Component.extend({
  layout,
  globalStore: service(),

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

    const store = this.get('globalStore');

    var eType = this.get('externalIdType');
    var eId = this.get('externalId');
    var id = this.get('identityNotParsed');

    if ( !id && eType && eId ) {
     id =`1i!${eType}:${eId}`;
    }

    if ( this.get('identity') || notFound[id] ) {
      return;
    }

    if ( id )
    {
      let identity = store.getById('identity', id);
      if ( identity ) {
        this.set('identity', identity);
        return;
      }

      this.set('loading', true);
      store.find('identity', id).then((identity) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.set('identity', identity);
      }).catch((/*err*/) => {
        // Do something..
        notFound[id] = true;
      }).finally(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.set('loading', false);
      });
    }
  },

  classNames: ['gh-block'],
  attributeBindings: ['aria-label:identity.name'],

  avatarSrc: alias('identity.profilePicture'),
  url: alias('identity.profileUrl'),

  login: computed('identity.username', 'identity.id', function() {
    return this.get('identity.username') || this.get('identity.id');
  }),

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
