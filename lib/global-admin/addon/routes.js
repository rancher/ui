import buildRoutes from 'ember-engines/routes';
import {addRoutes} from 'ui/utils/additional-routes';

let Routes = function() {
  this.route('global-admin', {path: '/gadmin'}, function() {
    this.route('accounts', {path: '/accounts'}, function() {
      this.route('index', {path: '/'});
      this.route('new', {path: '/add'});
    });
  });
}

addRoutes(Routes);

export default buildRoutes(Routes);
