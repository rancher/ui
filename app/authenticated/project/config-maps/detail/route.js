import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  model(params) {
    const all = this.modelFor('authenticated.project.config-maps');

    const configMaps = all.configMaps.findBy('id', params.config_map_id);

    if ( configMaps ) {
      return configMaps;
    }

    return get(this, 'store').find('configMap', params.config_map_id);
  },
});
