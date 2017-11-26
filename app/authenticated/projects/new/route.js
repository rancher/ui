import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
    authzStore: service('authz-store'),
    model: function () {
        const project = this.get('authzStore').createRecord({
            type: `project`,
            name: '',
        });
        const projectRoleTemplateBindings = [{
            subjectKind: 'User',
            subjectName: '',
            projectRoleTemplateId: '',
            projectId: '',
        }];
        return hash({
            project,
            projectRoleTemplateBindings,
            projects: this.get('authzStore').findAll('project'),
            roles: this.get('authzStore').findAll('projectRoleTemplate'),
        });
    },
});