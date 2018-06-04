import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { set, get } from '@ember/object';

const decomposeRedirectUrl = (url) => {
  return { clientId: url.split('?')[1].split('=')[1] }
}

export default Route.extend({
  globalStore: service(),
  session:     service(),

  model() {
    const globalStore = get(this, 'globalStore');
    const store = get(this, 'store');

    const loginConfigs = globalStore.request({ url: '/v3-public/authProviders' });
    const providers = store.findAll('sourceCodeProviderConfig');
    const settings = store.findAll('pipelineSetting');

    return hash({
      providers,
      loginConfigs,
      settings,
    }).then(({
      providers,
      loginConfigs,
      settings,
    }) => {
      const decomposedGithubAuthConfig = loginConfigs.findBy('id', 'github');

      if (decomposedGithubAuthConfig) {
        const desomposed = decomposeRedirectUrl(decomposedGithubAuthConfig.redirectUrl);

        decomposedGithubAuthConfig.enabled = true;
        decomposedGithubAuthConfig.clientId = desomposed.clientId;
      }

      return {
        providers,
        settings,
        githubAuthConfig: decomposedGithubAuthConfig
      }
    })
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.pipeline.settings');
  }),
});
