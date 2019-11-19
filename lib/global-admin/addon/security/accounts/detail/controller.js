import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, computed /* , set */ } from '@ember/object';

const GLOBAL_HEADERS = [
  {
    name:        'enabled',
    searchField: null,
    width:       30
  },
  {
    name:           'name',
    sort:           ['globalRole.displayName'],
    searchField:    'globalRole.displayName',
    translationKey: 'accountsPage.detail.table.headers.permission',
  },
  {
    name:           'created',
    searchField:    false,
    sort:           ['createdTs'],
    translationKey: 'accountsPage.detail.table.headers.created',
    width:          200,
  },
];

const PROJECT_HEADERS = [
  {
    name:           'projectName',
    searchField:    'project.displayName',
    sort:           ['project.displayName', 'displayName'],
    translationKey: 'accountsPage.detail.table.headers.projectName',
  },
  {
    name:           'name',
    searchField:    'roleTemplate.displayName',
    sort:           ['roleTemplate.displayName', 'project.displayName'],
    translationKey: 'accountsPage.detail.table.headers.role',
  },
  {
    name:           'created',
    searchField:    false,
    sort:           ['createdTs'],
    translationKey: 'accountsPage.detail.table.headers.created',
    width:          200,
  },
];

const CLUSTER_HEADERS = [
  {
    name:           'clusterName',
    searchField:    'cluster.displayName',
    sort:           ['cluster.displayName', 'project.displayName'],
    translationKey: 'accountsPage.detail.table.headers.clusterName',
  },
  {
    name:           'name',
    searchField:    'roleTemplate.displayName',
    sort:           ['roleTemplate.displayNAme'],
    translationKey: 'accountsPage.detail.table.headers.role',
  },
  {
    name:           'created',
    searchField:    false,
    sort:           ['createdTs'],
    translationKey: 'accountsPage.detail.table.headers.created',
    width:          200,
  },
];

const GROUP_HEADERS = [
  {
    name:           'groupName',
    searchField:    'group.displayName',
    sort:           ['group.displayName', 'group.id'],
    translationKey: 'accountsPage.detail.table.headers.groupName',
  },
  {
    name:           'name',
    searchField:    'roleTemplate.displayName',
    sort:           ['roleTemplate.displayNAme'],
    translationKey: 'accountsPage.detail.table.headers.role',
  },
  {
    name:           'created',
    searchField:    false,
    sort:           ['createdTs'],
    translationKey: 'accountsPage.detail.table.headers.created',
    width:          200,
  },
]


export default Controller.extend({
  router:         service(),

  globalHeaders:  GLOBAL_HEADERS,
  clusterHeaders: CLUSTER_HEADERS,
  projectHeaders: PROJECT_HEADERS,
  groupHeaders:   GROUP_HEADERS,
  sortGlobalBy:   'name',
  sortClusterBy:  'name',
  sortProjectBy:  'projectName',

  globalRoleMapping: computed('model.user.globalRoleBindings.[]', 'model.globalRoles', function() {
    let out = (get(this, 'model.globalRoles') || []).filterBy('isHidden', false).map((role) => {
      return {
        role,
        enabled: false
      };
    });

    (get(this, 'model.user.globalRoleBindings') || []).forEach((binding) => {
      const globalRole = get(binding, 'globalRole');

      if (get(globalRole, 'isHidden')) {
        this.getEnabledRoles(globalRole, out).forEach((r) => {
          r.enabled = true;
          r.binding = binding;
        });
      } else {
        let entry = out.findBy('role', globalRole);

        if (entry) {
          entry.enabled = true;
          entry.binding = binding;
        }
      }
    });

    return out;
  }),
  hasPermission(globalRoleRules, permission) {
    return globalRoleRules.find((gRule) => ((get(gRule, 'apiGroups') || []).indexOf('*') > -1 || (get(gRule, 'apiGroups') || []).indexOf(permission.apiGroup) > -1) &&
      ((get(gRule, 'resources') || []).indexOf('*') > -1 || (get(gRule, 'resources') || []).indexOf(permission.resource) > -1) &&
      ((get(gRule, 'verbs') || []).indexOf('*') > -1 || (get(gRule, 'verbs') || []).indexOf(permission.verb) > -1));
  },

  containsRule(globalRoleRules, rule) {
    const apiGroups = (get(rule, 'apiGroups') || []);
    const resources = (get(rule, 'resources') || []);
    const verbs = (get(rule, 'verbs') || []);
    const permissions = [];

    apiGroups.forEach((apiGroup) => resources.forEach((resource) => verbs.forEach((verb) => permissions.push({
      apiGroup,
      resource,
      verb
    }))));

    return permissions.every((permission) => this.hasPermission(globalRoleRules, permission));
  },

  getEnabledRoles(globalRole, out) {
    const globalRoleRules = (get(globalRole, 'rules') || []);

    return out.filter((r) => (get(r, 'role.rules') || []).every((rule) => this.containsRule(globalRoleRules, rule)));
  },

});
