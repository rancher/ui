import Ember from 'ember';
import C from 'ui/utils/constants';

// Useful context/condition shortcuts
export const getProjectId = function() { return this.get('projectId'); };
export const getClusterId = function() { return this.get('clusterId'); };

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
  // Project
  {
    scope: 'project',
    id: 'containers',
    localizedLabel: 'nav.containers.tab',
    route: 'authenticated.project.index',
    ctx: [getProjectId],
    moreCurrentWhen: ['containers','balancers','dns','volumes','k8s'],
  },

  {
    scope: 'project',
    id: 'project-hosts',
    localizedLabel: 'nav.hosts.tab',
    route: 'hosts',
    ctx: [getProjectId],
  },

  {
    scope: 'project',
    id: 'project-apps',
    localizedLabel: 'nav.apps.tab',
    route: 'apps-tab',
    ctx: [getProjectId],
    condition: function() { return this.get(`settings.${C.SETTING.CATALOG_URL}`); },
  },
  {
    scope: 'project',
    id: 'infra',
    localizedLabel: 'nav.infra.tab',
    ctx: [getProjectId],
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

  // Cluster
  {
    scope: 'cluster',
    id: 'cluster-hosts',
    localizedLabel: 'nav.cluster.hosts',
    route: 'authenticated.clusters.cluster.hosts',
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-k8s',
    localizedLabel: 'nav.cluster.k8s',
    route: 'authenticated.clusters.cluster.k8s',
    condition: function() { return this.get(`cluster.isKubernetes`); },
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-networking',
    localizedLabel: 'nav.cluster.networking',
    route: 'authenticated.clusters.cluster.networking',
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-storage',
    localizedLabel: 'nav.cluster.storage',
    route: 'authenticated.clusters.cluster.storage',
    ctx: [getClusterId],
  },

  // Admin
  {
    scope: 'admin',
    id: 'admin-audit',
    localizedLabel: 'nav.admin.audit',
    route: 'admin-tab.audit-logs',
  },
  {
    scope: 'admin',
    id: 'admin-accounts',
    localizedLabel: 'nav.admin.accounts',
    route: 'admin-tab.accounts',
  },
  {
    scope: 'admin',
    id: 'admin-processes',
    localizedLabel: 'nav.admin.processes',
    route: 'admin-tab.processes',
  },
  {
    scope: 'admin',
    id: 'admin-settings',
    localizedLabel: 'nav.admin.settings.tab',
    route: 'admin-tab.settings',
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
