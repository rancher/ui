import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function () {
    return this.get('authzStore').find('roleTemplate', null, { url: 'roleTemplates', forceReload: true, removeMissing: true }).then((roles) => roles);
  },
});
