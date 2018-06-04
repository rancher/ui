import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { set, get } from '@ember/object';

export default Route.extend({
  model() {
    const store = get(this, 'store');
    const pipelines = store.findAll('pipeline');
    const accounts = store.findAll('sourceCodeCredential');
    const providerConfig = store.findAll('sourceCodeProviderConfig')
    const providers = store.findAll('sourceCodeProvider', { forceReload: true });

    return hash({
      accounts,
      providerConfig,
      pipelines,
      providers,
    }).then((hash) => {
      const {
        accounts,
        providerConfig,
        pipelines,
        providers,
      } = hash;

      const validAccounts = accounts.filter((account) => !account.logout);

      if ( get(validAccounts, 'length') ) {
        return get(validAccounts, 'firstObject').followLink('sourceCodeRepositories')
          .then((res) => {
            return {
              pipelines,
              accounts:     validAccounts,
              providers,
              canConfig:    providerConfig.length > 0,
              repositories: res,
            }
          });
      } else {
        return {
          pipelines,
          accounts:     validAccounts,
          providers,
          canConfig:    providerConfig.length > 0,
          repositories: [],
        };
      }
    })
  },

  resetController(controller) {
    set(controller, 'errors', []);
  },
});
