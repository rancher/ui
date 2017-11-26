import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
    authzStore: service('authz-store'),
    model: function (params) {
        return hash({
            project: this.get('authzStore').find('project', params.project_id),
            projectRoleTemplateBindings: this.get('authzStore').findAll('projectRoleTemplateBinding', null, { filter: { projectId: params.project_id } }),
            projects: this.get('authzStore').findAll('project'),
            roles: this.get('authzStore').findAll('projectRoleTemplate'),
        });
    },
});