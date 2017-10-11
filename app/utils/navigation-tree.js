import Ember from 'ember';
import C from 'ui/utils/constants';

// Useful context/condition shortcuts
export const getProjectId = function() { return this.get('projectId'); };
export const getNamespaceId = function() { return this.get('namespaceId'); };

/* Tree item options
  {
    id: 'str' (identifier to allow removal... should be unique)
    localizedLabel: 'i18n key', (or function that returns one)
    label: 'Displayed unlocalized label', (or function that returns string)
    icon: 'icon icon-something',
    condition: function() {
      // return true if this item should be displayed
      // condition can depend on anything page-header/component.js shouldUpdateNavTree() depends on
    }
    target: '_blank', (for url only)
    route: 'target.route.path', // as in link-to
    ctx: ['values', 'asContextToRoute', orFunctionThatReturnsValue, anotherFunction]
    queryParams: {a: 'hello', b: 'world'],
    moreCurrentWhen: ['additional.routes','for.current-when'],

    submenu: [
      // Another tree item (only one level of submenu supported, no arbitrary depth nesting)
      {...},
      {...}
    ]
  },
*/
const navTree = [
  // Cattle
  {
    id: 'containers',
    localizedLabel: 'nav.containers.tab',
    route: 'authenticated.project.index',
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject'); },
    moreCurrentWhen: ['containers','balancers','dns','volumes','k8s'],
  },

  {
    id: 'hosts',
    localizedLabel: 'nav.hosts.tab',
    route: 'hosts',
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject'); },
  },

  // App Catalog
  {
    id: 'apps',
    localizedLabel: 'nav.apps.tab',
    route: 'apps-tab',
    ctx: [getProjectId],
    condition: function() {
      return this.get('hasProject') &&
      this.get(`settings.${C.SETTING.CATALOG_URL}`);
    },
  },

  // Infrastructure = Resources
  {
    id: 'infra',
    localizedLabel: 'nav.infra.tab',
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject'); },
    submenu: [
      {
        id: 'infra-keys',
        localizedLabel: 'nav.infra.keys',
        icon: 'icon icon-key',
        route: 'authenticated.project.apikeys',
        ctx: [getProjectId],
      },
      {
        id: 'infra-certificates',
        localizedLabel: 'nav.infra.certificates',
        icon: 'icon icon-certificate',
        route: 'certificates',
        ctx: [getProjectId],
      },
      {
        id: 'infra-registries',
        localizedLabel: 'nav.infra.registries',
        icon: 'icon icon-database',
        route: 'registries',
        ctx: [getProjectId],
      },
      {
        id: 'infra-secrets',
        localizedLabel: 'nav.infra.secrets',
        icon: 'icon icon-secrets',
        route: 'secrets',
        ctx: [getProjectId],
      },
      {
        id: 'infra-hooks',
        localizedLabel: 'nav.infra.hooks',
        icon: 'icon icon-link',
        route: 'authenticated.project.hooks',
        ctx: [getProjectId],
      },
    ],
  },

  // Admin
  {
    id: 'admin',
    localizedLabel: 'nav.admin.tab',
    condition: function() { return this.get('isAdmin'); },
    submenu: [
      {
        id: 'admin-audit',
        localizedLabel: 'nav.admin.audit',
        icon: 'icon icon-folder-open',
        route: 'admin-tab.audit-logs',
      },
      {
        id: 'admin-accounts',
        localizedLabel: 'nav.admin.accounts',
        icon: 'icon icon-users',
        route: 'admin-tab.accounts',
      },
      {
        id: 'admin-processes',
        localizedLabel: 'nav.admin.processes',
        icon: 'icon icon-processes',
        route: 'admin-tab.processes',
      },
      {
        divider: true
      },
      {
        id: 'admin-access',
        localizedLabel: 'nav.admin.access',
        icon: 'icon icon-key',
        route: 'admin-tab.auth',
      },
      {
        id: 'admin-ha',
        localizedLabel: 'nav.admin.ha',
        icon: 'icon icon-umbrella',
        route: 'admin-tab.ha',
      },
      {
        id: 'admin-machine',
        localizedLabel: 'nav.admin.machine',
        icon: 'icon icon-host',
        route: 'admin-tab.machine',
      },
      {
        id: 'admin-settings',
        localizedLabel: 'nav.admin.settings',
        icon: 'icon icon-network',
        route: 'admin-tab.settings',
      },
    ],
  },

];

export function addItem(opt) {
  navTree.pushObject(opt);
}

export function removeId(id) {
  for ( let i = navTree.length-1 ; i >= 0 ; i-- )
  {
    if ( navTree[i].id === id ) {
      navTree.removeAt(i);
    } else if ( navTree[i].submenu && Ember.isArray(navTree[i].submenu) ) {
      let sub = navTree[i].submenu;
      for ( var j = sub.length-1 ; j >= 0 ; j-- )
      {
        if ( sub[j].id === id ) {
          sub.removeAt(j);
        }
      }
    }
  }
}

export function get() {
  return Ember.copy(navTree,true);
}
