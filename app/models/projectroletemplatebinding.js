import Role from 'ui/models/roletemplate';
import { reference } from 'ember-api-store/utils/denormalize';

var ProjectRoleTemplateBinding = Role.extend({
  type: 'projectRoleTemplateBinding',
  project: reference('projectId', 'project'),
});

export default ProjectRoleTemplateBinding;
