import Controller from '@ember/controller';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { alias } from '@ember/object/computed';

const DNS_PROVIDERS = ['route53', 'alidns', 'cloudflare'];

export default Controller.extend(ViewNewEdit, {
  router:             service(),
  globalStore:        service(),

  queryParams:        ['id', 'activeProvider'],
  memberAccessTypes:  ['owner', 'read-only'],
  id:                 null,

  activeProvider:     'route53',
  mode:               'new',
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

        if (!members) {
          members = [];
        }

        set(principal, 'accessType', 'owner');

        members.pushObject(this.globalStore.createRecord(principal));

        set(this, 'model.members', members);
      }
    },

    removeMember(member) {
      let { members } = this.model;

      members.removeObject(member);
    },
  },

  availableProviders: computed('isEdit', function() {
    if ( get(this, 'isEdit') ) {
      return [{ name: get(this, 'activeProvider') }];
    } else {
      return DNS_PROVIDERS.map( (p) => {
        return { name: p };
      });
    }
  }),

  validate() {
    const providerConfig = get(this, `config.${ this.activeProvider }ProviderConfig`);
    const { mode }       = this;

    if (mode === 'edit' && providerConfig && providerConfig.hasOwnProperty('secretKey')) {
      if (providerConfig.secretKey === '' || providerConfig.secretKey === null) {
        delete providerConfig.secretKey;
      }
    }

    return this._super(...arguments);
  },

  doneSaving() {
    this.send('cancel');
  },
});
