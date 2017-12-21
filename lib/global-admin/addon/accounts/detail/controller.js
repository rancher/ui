import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get/* , set */ } from '@ember/object';

export default Controller.extend({
  activeUserIdentity: alias('model.user.principalIds.firstObject'),
  modalService: service('modal'),
  externalUtils: service(),
  router: service(),
  sortBy: 'name',
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
    edit() {
      this.get('modalService').toggleModal('modal-edit-user', {
        user: get(this, 'model.user'),
        myGlobalRoles: get(this, 'myGlobalRoles'),
      });
    }
  },

  myGlobalRoles: computed('model.globalRoles.[]', 'model.globalRoleBindings.[]', function() {
    let userRoles = get(this, 'model.globalRoleBindings');
    let neu = [];
    // TODO 2.0 is this the best way to find the matches?
    get(this, 'model.globalRoles').forEach((grb) => {
      let tmp = {name: grb.name, active: false, globalId: get(grb, 'id')};
      let userRole = userRoles.findBy('globalRoleId', get(grb, 'id'));
      if (userRole) {
        tmp.active=true;
        tmp.binding = userRole;
      }
      neu.push(tmp);
    });

    return neu;
  }),

  projectRoles: computed('model.projectRoleTemplateBindings.[]', function() {
    return get(this, 'model.projectRoleTemplateBindings').filter((role) => {
      // TODO 2.0 need api filter
      // console.log(get(role, 'projects'));
      return get(role, 'subjectName') === get(this, 'model.user.principalIds.firstObject');
    })
  }),

  clusterRoles: computed('model.clusterRoleTemplateBindings.[]', function() {
    return get(this, 'model.clusterRoleTemplateBindings').filter((role) => {
      // TODO 2.0 need api filter
      return get(role, 'subjectName') === get(this, 'model.user.principalIds.firstObject');
    })
  }),

});
