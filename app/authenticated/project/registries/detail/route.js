import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  model(params) {
    const all = this.modelFor('authenticated.project.registries');

    let registry = all.projectDockerCredentials.findBy('id', params.registry_id);

    if ( registry ) {
      return registry;
    }

    registry = all.namespacedDockerCredentials.findBy('id', params.registry_id);
    if ( registry ) {
      return registry;
    }

    return get(this, 'store').find('dockerCredential', params.registry_id);
  },
});
