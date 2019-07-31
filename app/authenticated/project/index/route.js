import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

const DEFAULT_ROUTE = 'containers';
const VALID_ROUTES = [DEFAULT_ROUTE, 'scaling-groups', 'ingresses', 'authenticated.project.dns', 'volumes'];

export default Route.extend({
  redirect() {
    let route = this.get(`session.${ C.SESSION.CONTAINER_ROUTE }`);

    if ( !VALID_ROUTES.includes(route) ) {
      route = DEFAULT_ROUTE;
    }

    this.replaceWith(route);
  },
});
