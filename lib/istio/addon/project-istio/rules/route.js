import Route from '@ember/routing/route';
import { get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  session:     service(),
  catalog:     service(),
  scope:        service(),

  beforeModel() {
    return get(this, 'catalog').fetchUnScopedCatalogs();
  },

  model(/* params, transition */) {
    const projectId = get(this.scope, 'currentProject.id');

    return get(this, 'store').findAll('app')
      .then((apps) => {
        return {
          apps,
          projectId
        }
      });
  },

  afterModel(model) {
    return get(this, 'catalog').fetchAppTemplates(get(model, 'apps'));
  },

  setDefaultRoute: on('activate', function() {
    setProperties(this, {
      [`session.${ C.SESSION.ISTIO_ROUTE }`]:   'project-istio.rules',
      [`session.${ C.SESSION.PROJECT_ROUTE }`]: 'authenticated.project.istio.project-istio.rules'
    })
  }),
});
