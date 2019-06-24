import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import { next } from '@ember/runloop';
import Identicon from 'identicon.js';

let missingPrincipals = [];

export default Component.extend({
  globalStore:        service(),

  layout,
  // Principal or id+parsedExternalType
  principal:          null,
  parsedExternalType: null,
  principalId:        null,

  avatar:             true,
  link:               true,
  size:               35,

  loading:            false,
  classNames:         ['gh-block'],
  attributeBindings:  ['aria-label:principal.name'],
  unknownUser:        false,
  wide:               true,


  init() {
    this._super(...arguments);

    const store            = get(this, 'globalStore');
    const principalId      = get(this, 'principalId');
    const missingPrincipal = missingPrincipals.indexOf(principalId);

    if ( get(this, 'principal') ||  missingPrincipal > 0) {
      return;
    }

    if ( principalId ) {
      let principal = store.getById('principal', principalId);

      if ( principal ) {
        set(this, 'principal', principal);

        return;
      }

      set(this, 'loading', true);

      store.find('principal', principalId, { forceReload: true }).then((principal) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        next(() => {
          set(this, 'principal', principal);
        });
      }).catch((/* err*/) => {
        // Do something..
        missingPrincipals.pushObject(principalId);
      }).finally(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        set(this, 'loading', false);
        set(this, 'unknownUser', true);
      });
    }
  },

  avatarSrc: computed('principal', function() {
    return `data:image/png;base64,${ new Identicon(AWS.util.crypto.md5(get(this, 'principal.id') || 'Unknown', 'hex'), 80, 0.01).toString() }`;
  }),

  willDestroy() {
    this._super(...arguments);

    missingPrincipals = [];
    set(this, 'unknownUser', false);
  },


});
