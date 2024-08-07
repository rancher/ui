import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const all = this.modelFor('authenticated.project.config-maps');

    const configMaps = all.configMaps.findBy('id', params.config_map_id);

    if ( configMaps ) {
      return configMaps;
    }

    return this.store.find('configMap', params.config_map_id);
  },
});
