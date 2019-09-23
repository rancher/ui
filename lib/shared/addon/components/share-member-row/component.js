import Errors from 'ui/utils/errors';
import Component from '@ember/component';
import layout from './template';
import { set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Identicon from 'identicon.js';
import C from 'shared/utils/constants';

export default Component.extend({
  globalStore:          service(),
  layout,

  tagName:              '',
  member:               null,
  editing:              true,
  isPublic:             false,
  clusterResource:      null,
  users:                null,
  principal:            null,
  principalId:          null,
  principalGravatarSrc: null,

  init() {
    this._super(...arguments);

    const { isPublic, member } = this;


    if (!isPublic && (member.userPrincipalId || member.groupPrincipalId)) {
      const principalId = member.userPrincipalId || member.groupPrincipalId;

      this.globalStore.rawRequest({
        url:    `principals/${ encodeURIComponent(principalId) }`,
        method: 'GET',
      }).then((xhr) => {
        if ( xhr.status === 204 ) {
          return;
        }

        if ( xhr.body && typeof xhr.body === 'object') {
          set(this, 'principal', set(this, 'external', xhr.body));
          this.principalChanged();
        }

        return xhr;
      }).catch((xhr) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        if (member.userPrincipalId) {
          set(this, 'principalId', member.userPrincipalId);
          set(this, 'principalGravatarSrc', `data:image/png;base64,${ new Identicon(AWS.util.crypto.md5(member.userPrincipalId || 'Unknown', 'hex'), 80, 0.01).toString() }`)
        }

        return xhr;
      });
    }
  },

  actions: {
    gotError(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },
    addAuthorized(principal) {
      if (principal) {
        let { principalType, id } = principal;

        if (principalType === 'user') {
          set(this, 'member.userPrincipalId', id);
        } else if (principalType === 'group') {
          set(this, 'member.groupPrincipalId', id);
        }
      }
    },
    remove() {
      this.remove(this.member);
    },
  },

  choices: computed('C.CLUSTER_TEMPLATE_ROLES', () => {
    let roles = C.CLUSTER_TEMPLATE_ROLES;

    return Object.keys(roles).map((key) => {
      return {
        label: `shareMemberRow.accessType.${ roles[key] }`,
        value: roles[key]
      };
    })
  }),

  noUpdate: computed('principal', 'principalId', function() {
    if (this.editing) {
      if (this.principal || this.principalId) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }),

  remove() {
    throw new Error('remove is a required action!')
  },

});
