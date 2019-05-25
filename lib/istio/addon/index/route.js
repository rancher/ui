import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

const DEFAULT_ROUTE = 'graph';
const VALID_ROUTES = [
  DEFAULT_ROUTE,
  'metrics',
  'rules',
];

export default Route.extend({
  session: service(),

  redirect() {
    let route = get(this, `session.${ C.SESSION.ISTIO_ROUTE }`);

    if ( !VALID_ROUTES.includes(route) ) {
      route = DEFAULT_ROUTE;
    }

    this.replaceWith(route);
  },
});
