import Controller from '@ember/controller';
import { get, /* set,  */setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';

const DNS_PROVIDERS = ['route53'];

export default Controller.extend(NewOrEdit, {
  router:             service(),
  globalStore:        service(),

  queryParams:        ['id'],
  id:                 null,


  availableProviders: null,
  activeProvider:     null,
  saveDisabled:       false,
  config:             alias('model'),
  primaryResource:    alias('config'),

  init() {
    this._super(...arguments);

    const availableProviders = DNS_PROVIDERS.map( (p) => {
      return { name: p };
    });
    let activeProvider = availableProviders.findBy('name', 'route53');

    activeProvider = get(activeProvider, 'name');

    setProperties(this, {
      availableProviders,
      activeProvider,
    });
  },

  actions: {
    switchProvider() {},
    cancel() {
      this.router.transitionTo('global-admin.global-dns.providers.index');
    }
  },

  doneSaving() {
    this.send('cancel');
  },
});
