import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

const headers = [
  {
    translationKey: 'rolesPage.index.table.name',
    name: 'name',
    sort: ['name'],
  },
  {
    translationKey: 'rolesPage.index.table.created',
    name: 'created',
    sort: ['created'],
    width: '200',
  },
]

export default Controller.extend({
  sortBy: 'name',
  headers: headers,
  queryParams: ['type'],
  authzStore: service('authz-store'),
  type: 'project',
  searchText: '',

  onRoleTypeChanged: function () {
    const roleType = this.get('type');
    return this.get('authzStore').find(`${roleType}RoleTemplate`, null, {
      url: `${roleType}RoleTemplates`,
      forceReload: true,
      removeMissing: true,
      sortBy: 'name',
    })
      .then((roles) => {
        this.set('model', roles);
        this.set('searchText', '');
      });
  }.observes('type'),
});
