import Route from '@ember/routing/route';
import { setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  session:     service(),

  setDefaultRoute: on('activate', function() {
    setProperties(this, {
      [`session.${ C.SESSION.ISTIO_ROUTE }`]:   'metrics',
      [`session.${ C.SESSION.PROJECT_ROUTE }`]: 'authenticated.project.istio.metrics'
    });
  }),
});

