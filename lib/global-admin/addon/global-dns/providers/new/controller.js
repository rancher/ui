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
    }
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
