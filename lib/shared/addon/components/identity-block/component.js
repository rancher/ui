import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';

let notFound={};

export default Component.extend({
  layout,
  globalStore:        service(),

  // Principal or id+parsedExternalType
  principal:          null,
  parsedExternalType: null,
  id:                 null,

  avatar:             true,
  link:               true,
  size:               35,

  loading:            false,
  classNames:         ['gh-block'],
  attributeBindings:  ['aria-label: principal.name'],


  init() {
    this._super(...arguments);

    const store = get(this,'globalStore');
    const id = get(this, 'id');

    if ( get(this,'principal') || notFound[id] ) {
      return;
    }

    if ( id )
    {
      let principal = store.getById('principal', id);
      if ( principal ) {
        set(this,'principal', principal);
        return;
      }

      set(this,'loading', true);
      store.find('principal', id).then((principal) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        set(this,'principal', principal);
      }).catch((/*err*/) => {
        // Do something..
        notFound[id] = true;
      }).finally(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        set(this,'loading', false);
      });
    }
  },

  avatarSrc: computed('principal', function() {
    return `data:image/png;base64,${new Identicon(AWS.util.crypto.md5(get(this, 'principal.id')||'Unknown', 'hex'), 80, 0.01).toString()}`;
  })

});
