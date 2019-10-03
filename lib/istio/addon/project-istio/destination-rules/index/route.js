import { on } from '@ember/object/evented';
import { get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  session:      service(),
  scope:        service(),

  model(/* params, transition */) {
    const store = get(this, 'store');
    const projectId = get(this.scope, 'currentProject.id');

    return store.findAll('destinationrule')
      .then((data) => {
        return {
          data,
          supported: true,
          projectId,
        }
      })
      .catch(() => {
        return {
          data:      [],
          supported: false,
          projectId,
        }
      });
  },

  setDefaultRoute: on('activate', function() {
    setProperties(this, {
      [`session.${ C.SESSION.ISTIO_ROUTE }`]:   'destination-rules',
      [`session.${ C.SESSION.PROJECT_ROUTE }`]: 'authenticated.project.istio.project-istio.destination-rules'
    });
  }),
});
