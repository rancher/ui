import { set } from '@ember/object';
import Route from '@ember/routing/route';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      controller.set('search', '');
    }
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'catalog-tab.index');
  }),
});
