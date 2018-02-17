import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';

let notFound={};

export default Component.extend({
  layout,
  globalStore:        service(),

  // Principal or id+parsedExternalType
  principal:          null,
  parsedExternalType: null,
  id:                 null,
  principalNotParsed: null,

  avatar:             true,
  link:               true,
  size:               35,

  loading:            false,
  classNames:         ['gh-block'],
  attributeBindings:  ['aria-label: principal.name'],


  init() {
    this._super(...arguments);

    const store = this.get('globalStore');

    var eType = this.get('parsedExternalType');
    var eId = this.get('id');
    var id = this.get('principalNotParsed');

    if ( !id && eType && eId ) {
     id =`1i!${eType}:${eId}`;
    }

    if ( this.get('principal') || notFound[id] ) {
      return;
    }

    if ( id )
    {
      let principal = store.getById('principal', id);
      if ( principal ) {
        this.set('principal', principal);
        return;
      }

      this.set('loading', true);
      store.find('principal', id).then((principal) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.set('principal', principal);
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

  avatarSrc: computed('principal', function() {
    return `data:image/png;base64,${new Identicon(AWS.util.crypto.md5(get(this, 'principal.id')||'Unknown', 'hex'), 80, 0.01).toString()}`;
  })

});
