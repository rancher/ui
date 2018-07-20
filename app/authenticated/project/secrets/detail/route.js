import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  model(params) {
    const all = this.modelFor('authenticated.project.secrets');

    let secret = all.projectSecrets.findBy('id', params.secret_id);

    if ( secret ) {
      return secret;
    }

    secret = all.namespacedSecrets.findBy('id', params.secret_id);
    if ( secret ) {
      return secret;
    }

    return get(this, 'store').find('secret', params.secret_id);
  },
});
