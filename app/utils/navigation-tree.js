import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseCatalogSetting } from 'ui/utils/parse-catalog-setting';

// Useful context/condition shortcuts
export const getProjectId = function() { return this.get('projectId'); };
export const getNamespaceId = function() { return this.get('namespaceId'); };
export const k8sReady = function() { return this.get('kubernetesReady'); };
export const swarmReady = function() { return this.get('swarmReady'); };

/* Tree item options
  {
    id: 'str' (identifier to allow removal... should be unique)
    label: 'Displayed label', (or function that returns string)
    icon: 'icon icon-somethign',
    condition: function() { return true if this item should be displayed },
      // condition can depend on anything page-header/component.js shouldUpdateNavTree() depends on:
      // 'currentPath','project.orchestrationState','projectId','namespaceId',`settings.${C.SETTING.CATALOG_URL}`,'settings.hasVm','isAdmin',
    url: 'http://any/url', (url or route required)
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
  // Kubernetes
  {
    id: 'k8s',
    label: 'Kubernetes',
    route: 'k8s-tab',
    ctx: [getProjectId],
    condition: function() { return this.get('hasKubernetes'); },
    moreCurrentWhen: ['authenticated.project.waiting'],
    submenu: [
      {
        id: 'k8s-services',
        label: 'Services',
        icon: 'icon icon-compass',
        route: 'k8s-tab.namespace.services',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        id: 'k8s-rcs',
        label: 'Replication Controllers',
        icon: 'icon icon-tachometer',
        route: 'k8s-tab.namespace.rcs',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        id: 'k8s-pods',
        label: 'Pods',
        icon: 'icon icon-containers',
        route: 'k8s-tab.namespace.pods',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        id: 'k8s-cli',
        label: 'Kubectl',
        icon: 'icon icon-terminal',
        route: 'k8s-tab.kubectl',
        ctx: [getProjectId],
        condition: k8sReady,
      },
    ],
  },

  // Swarm
  {
    id: 'swarm',
    label: 'Swarm',
    condition: function() { return this.get('hasProject') && this.get('hasSwarm'); },
    route: 'swarm-tab',
    ctx: [getProjectId],
    moreCurrentWhen: ['authenticated.project.waiting'],
    submenu: [
      {
        id: 'swarm-projects',
        label: 'Projects',
        icon: 'icon icon-layeredgroup',
        route: 'swarm-tab.projects',
        ctx: [getProjectId],
        condition: swarmReady,
      },
      {
        id: 'swarm-services',
        label: 'Services',
        icon: 'icon icon-layers',
        route: 'swarm-tab.services',
        ctx: [getProjectId],
        condition: swarmReady,
      },
      {
        id: 'swarm-cli',
        label: 'CLI',
        icon: 'icon icon-terminal',
        route: 'swarm-tab.console',
        ctx: [getProjectId],
        condition: swarmReady,
      },
    ]
  },

  // Mesos
  {
    id: 'mesos',
    label: 'Mesos',
    condition: function() { return this.get('hasProject') && this.get('hasMesos'); },
    route: 'mesos-tab',
    ctx: [getProjectId],
    moreCurrentWhen: ['authenticated.project.waiting'],
  },

  // Cattle Stacks
  {
    id: 'cattle-stacks',
    label: 'Stacks',
    route: 'environments',
    ctx: [getProjectId],
    moreCurrentWhen: ['authenticated.project.waiting'],
    condition: function() { return this.get('hasProject') && !this.get('hasKubernetes') && !this.get('hasSwarm'); },
  },

  // Cattle System
  {
    id: 'cattle-system',
    label: 'System',
    route: 'environments',
    ctx: [getProjectId],
    queryParams: {which: 'system'},
    condition: function() {
      return this.get('hasProject') &&
      this.get('hasCattleSystem') &&
      !this.get('hasKubernetes') &&
      !this.get('hasSwarm');
    },
  },

  // K8s System
  {
    id: 'k8s-system',
    label: 'System',
    route: 'environments',
    ctx: [getProjectId],
    queryParams: {which: 'not-kubernetes'},
    condition: function() {
      return this.get('hasProject') &&
      this.get('hasKubernetes');
    },
  },

  // Swarm System
  {
    id: 'swarm-system',
    label: 'System',
    route: 'environments',
    ctx: [getProjectId],
    queryParams: {which: 'not-swarm'},
    condition: function() { return this.get('hasProject') && this.get('hasSwarm'); },
  },

  // Mesos System
  {
    id: 'mesos-system',
    label: 'System',
    route: 'environments',
    ctx: [getProjectId],
    queryParams: {which: 'not-mesos'},
    condition: function() { return this.get('hasProject') && this.get('hasMesos'); },
  },

  // Catalog
  {
    id: 'catalog',
    label: 'Catalog',
    route: 'catalog-tab',
    ctx: [getProjectId],
    condition: function() {
      return this.get('hasProject') &&
      this.get(`settings.${C.SETTING.CATALOG_URL}`) &&
      (!this.get('hasSwarm') || this.get('swarmReady')) &&
      (!this.get('hasKubernetes') || this.get('kubernetesReady'));
    },
    submenu: getCatalogSubtree,
  },

  // Infrastructure
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    route: 'infrastructure-tab',
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject'); },
    submenu: [
      {
        id: 'infrastructure-hosts',
        label: 'Hosts',
        icon: 'icon icon-host',
        route: 'hosts',
        ctx: [getProjectId],
      },
      {
        id: 'infrastructure-containers',
        label: 'Containers',
        icon: 'icon icon-box',
        route: 'containers',
        ctx: [getProjectId],
      },
      {
        id: 'infrastructure-vms',
        label: 'Virtual Machines',
        icon: 'icon icon-vm',
        route: 'virtualmachines',
        ctx: [getProjectId],
        condition: function() { return this.get('settings.hasVm'); },
      },
      {
        id: 'infrastructure-storagepools',
        label: 'Storage Pools',
        icon: 'icon icon-hdd',
        route: 'storagepools',
        ctx: [getProjectId],
      },
      {
        id: 'infrastructure-certificates',
        label: 'Certificates',
        icon: 'icon icon-certificate',
        route: 'certificates',
        ctx: [getProjectId],
      },
      {
        id: 'infrastructure-registries',
        label: 'Registries',
        icon: 'icon icon-database',
        route: 'registries',
        ctx: [getProjectId],
      },
    ],
  },

  // Admin
  {
    id: 'admin',
    label: 'Admin',
    route: 'admin-tab',
    condition: function() { return this.get('isAdmin'); },
    submenu: [
      {
        id: 'admin-audit',
        label: 'Audit Log',
        icon: 'icon icon-folder-open',
        route: 'admin-tab.audit-logs',
      },
      {
        id: 'admin-processes',
        label: 'Processes',
        icon: 'icon icon-processes',
        route: 'admin-tab.processes',
      },
      {
        id: 'admin-accounts',
        label: 'Accounts',
        icon: 'icon icon-users',
        route: 'admin-tab.accounts',
      },
      { divider: true },
      {
        id: 'admin-access',
        label: 'Access Control',
        icon: 'icon icon-key',
        route: 'admin-tab.auth',
      },
      {
        id: 'admin-settings',
        label: 'Settings',
        icon: 'icon icon-network',
        route: 'admin-tab.settings',
      },
      {
        id: 'admin-ha',
        label: 'High-Availability',
        icon: 'icon icon-umbrella',
        route: 'admin-tab.ha',
      },
    ],
  },

  // API
  {
    id: 'api',
    label: 'API',
    icon: 'icon icon-terminal',
    route: 'authenticated.project.apikeys',
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject'); },
  }
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

function getCatalogSubtree() {
  let repos = Object.keys(parseCatalogSetting(this.get(`settings.${C.SETTING.CATALOG_URL}`))).sort();
  let showAll = false;
  let showLibrary = false;

  if ( repos.indexOf(C.CATALOG.LIBRARY_KEY) >= 0 || repos.indexOf(C.CATALOG.COMMUNITY_KEY) >= 0 ) {
    showLibrary = true;
    repos.removeObject(C.CATALOG.LIBRARY_KEY);
    repos.removeObject(C.CATALOG.COMMUNITY_KEY);
  }

  showAll = repos.length > 1 || (repos.length === 1 && showLibrary);

  let out = [];
  if ( showAll ) {
    out.push({
      id: 'catalog-all',
      label: 'All',
      icon: 'icon icon-globe',
      route: 'catalog-tab',
      ctx: [getProjectId],
      queryParams: {catalogId: 'all'}
    });
  }

  if ( showLibrary ) {
    if ( showAll ) {
      out.push({divider: true});
    }

    out.push({
      id: 'catalog-library',
      label: 'Library',
      icon: 'icon icon-catalog',
      route: 'catalog-tab',
      ctx: [getProjectId],
      queryParams: {catalogId: 'library'}
    });
  }

  repos.forEach((repo) => {
    out.push({
      id: 'catalog-'+repo,
      label: repo,
      icon: 'icon icon-users',
      route: 'catalog-tab',
      ctx: [getProjectId],
      queryParams: {catalogId: repo}
    });
  });


  if ( out.length === 1 ) {
    return [];
  } else {
    return out;
  }
}

