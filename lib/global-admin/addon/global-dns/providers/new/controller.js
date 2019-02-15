import Controller from '@ember/controller';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';

const DNS_PROVIDERS = ['route53', 'cloudflare', 'alidns'];

export default Controller.extend(NewOrEdit, {
  router:             service(),
  globalStore:        service(),

  queryParams:        ['id', 'activeProvider'],
  id:                 null,

  activeProvider:     'route53',
  saveDisabled:       false,
  config:             alias('model'),
  primaryResource:    alias('config'),

  actions: {
    switchProvider(provider) {
      set(this, 'activeProvider', provider);
    },

    cancel() {
      this.router.transitionTo('global-admin.global-dns.providers.index');
    },

    addAuthorizedPrincipal(principal) {
      if (principal) {
        let { members = [] } = this.model;
        const { principalType, id } = principal;

        const nue = {
          type:        'member',
          accessType:  'owner',
          displayType: get(principal, 'displayType') || principalType,
          displayName: get(principal, 'displayName') || get(principal, 'loginName') || get(principalType, 'id'),
        };

        if (principalType === 'group') {
          set(nue, 'groupPrincipalId', id);
        } else if (principalType === 'user') {
          set(nue, 'userPrincipalId', id);
        }


        members.pushObject(nue);

        set(this, 'model.members', members);
      }
    },

    removeMember(member) {
      let { members } = this.model;

      members.removeObject(member);
    },
  },

  availableProviders: computed('editing', function() {
    if ( get(this, 'editing') ) {
      return [{ name: get(this, 'activeProvider') }];
    } else {
      return DNS_PROVIDERS.map( (p) => {
        return { name: p };
      });
    }
  }),

  doneSaving() {
    this.send('cancel');
  },
});
