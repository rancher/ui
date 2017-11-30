import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  authzStore: service('authz-store'),
  scope: service(),
  model: function () {
    const project = this.get('authzStore').createRecord({
      type: `project`,
      name: '',
      clusterId: this.get('scope.currentCluster.id'),
    });
    return hash({
      project,
      projects: this.get('authzStore').findAll('project'),
      roles: this.get('authzStore').findAll('projectRoleTemplate'),
    });
  },
});
