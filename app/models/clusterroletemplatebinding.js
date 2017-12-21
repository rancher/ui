import Role from 'ui/models/roletemplate';
import { reference } from 'ember-api-store/utils/denormalize';

var ClusterRoleTemplateBinding = Role.extend({
  type:    'clusterRoleTemplateBinding',
  cluster: reference('clusterId', 'cluster'),
});

export default ClusterRoleTemplateBinding;
