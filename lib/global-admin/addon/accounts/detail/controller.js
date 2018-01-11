import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get/* , set */ } from '@ember/object';

export default Controller.extend({
  activeUserIdentity: alias('model.user.principalIds.firstObject'),
  projectRoles:       alias('model.projectRoleTemplateBindings'),
  clusterRoles:       alias('model.clusterRoleTemplateBindings'),
  externalUtils:      service(),
  router:             service(),
  sortBy:             'name',
  projectHeaders:  [
    {
      name:           'name',
      sort:           ['name'],
      translationKey: 'accountsPage.detail.table.headers.role',
      // width:          125,
    },
    {
      name:           'project.name',
      sort:           ['project.name', 'project.id'],
      translationKey: 'accountsPage.detail.table.headers.projectName',
      // width:          125,
    },
  ],

  clusterHeaders:  [
    {
      name:           'name',
      sort:           ['name'],
      translationKey: 'accountsPage.detail.table.headers.role',
      // width:          125,
    },
    {
      name:           'cluster.name',
      sort:           ['cluster.name', 'cluster.id'],
      translationKey: 'accountsPage.detail.table.headers.clusterName',
      // width:          125,
    },
  ],

  actions: {
    launchOnCluster(project) {
      get(this, 'externalUtils').switchProject(get(project, 'id'), 'authenticated.project', [project.clusterId, {queryParams: {backTo: 'global.accounts'}}]);
    },
  },
});
