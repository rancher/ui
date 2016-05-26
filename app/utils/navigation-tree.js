import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseCatalogSetting } from 'ui/utils/parse-catalog-setting';

// Useful context/condition shortcuts
export const getProjectId = function() { return this.get('projectId'); };
export const getNamespaceId = function() { return this.get('namespaceId'); };
export const k8sReady = function() { return this.get('kubernetesReady'); };
export const swarmReady = function() { return this.get('swarmReady'); };
export const mesosReady = function() { return this.get('mesosReady'); };

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
    alertRoute: 'target.route.path', // as in link-to
    alertCondition: function() {
      // return true if the alert (!) icon should be displayed
      // can depend on anything page-header/component.js shouldUpdateNavTree() depends on
    }
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
    localizedLabel: 'nav.k8s.tab',
    route: 'k8s-tab',
    ctx: [getProjectId],
    condition: function() { return this.get('hasKubernetes'); },
    moreCurrentWhen: ['authenticated.project.waiting'],
    submenu: [
      {
        id: 'k8s-services',
        localizedLabel: 'nav.k8s.services',
        icon: 'icon icon-compass',
        route: 'k8s-tab.namespace.services',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        id: 'k8s-rcs',
        localizedLabel: 'nav.k8s.rcs',
        icon: 'icon icon-tachometer',
        route: 'k8s-tab.namespace.rcs',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        id: 'k8s-pods',
        localizedLabel: 'nav.k8s.pods',
        icon: 'icon icon-containers',
        route: 'k8s-tab.namespace.pods',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        id: 'k8s-cli',
        localizedLabel: 'nav.k8s.cli',
        icon: 'icon icon-terminal',
        route: 'k8s-tab.kubectl',
        ctx: [getProjectId],
        condition: k8sReady,
      },
      {
        id: 'k8s-system',
        localizedLabel: 'nav.k8s.system',
        icon: 'icon icon-network',
        route: 'environments',
        ctx: [getProjectId],
        queryParams: {which: 'not-kubernetes'},
      },
    ],
  },

  // Swarm
  {
    id: 'swarm',
    localizedLabel: 'nav.swarm.tab',
    condition: function() { return this.get('hasProject') && this.get('hasSwarm'); },
    route: 'swarm-tab',
    ctx: [getProjectId],
    moreCurrentWhen: ['authenticated.project.waiting','environments'],
    submenu: [
      {
        id: 'swarm-projects',
        localizedLabel: 'nav.swarm.projects',
        icon: 'icon icon-layeredgroup',
        route: 'swarm-tab.projects',
        ctx: [getProjectId],
        condition: swarmReady,
      },
      {
        id: 'swarm-services',
        localizedLabel: 'nav.swarm.services',
        icon: 'icon icon-layers',
        route: 'swarm-tab.services',
        ctx: [getProjectId],
        condition: swarmReady,
      },
      {
        id: 'swarm-cli',
        localizedLabel: 'nav.swarm.cli',
        icon: 'icon icon-terminal',
        route: 'swarm-tab.console',
        ctx: [getProjectId],
        condition: swarmReady,
      },
      {
        id: 'swarm-system',
        localizedLabel: 'nav.swarm.system',
        icon: 'icon icon-network',
        route: 'environments',
        ctx: [getProjectId],
        queryParams: {which: 'not-swarm'},
      },
    ]
  },

  // Mesos
  {
    id: 'mesos',
    localizedLabel: 'nav.mesos.tab',
    condition: function() { return this.get('hasProject') && this.get('hasMesos'); },
    route: 'mesos-tab',
    ctx: [getProjectId],
    moreCurrentWhen: ['authenticated.project.waiting'],
    submenu: [
      {
        id: 'mesos-web',
        localizedLabel: 'nav.mesos.web',
        icon: 'icon icon-link',
        route: 'mesos-tab.index',
        ctx: [getProjectId],
        condition: mesosReady,
      },
      {
        id: 'mesos-system',
        localizedLabel: 'nav.mesos.system',
        icon: 'icon icon-network',
        route: 'environments',
        ctx: [getProjectId],
        queryParams: {which: 'not-mesos'},
      },
    ],
  },

  // Cattle
  {
    id: 'cattle',
    localizedLabel: 'nav.cattle.tab',
    route: 'environments',
    queryParams: {which: 'user'},
    ctx: [getProjectId],
    moreCurrentWhen: ['authenticated.project.waiting'],
    condition: function() { return this.get('hasProject') && !this.get('hasKubernetes') && !this.get('hasSwarm') && !this.get('hasMesos'); },
    submenu: [
      {
        id: 'cattle-all',
        localizedLabel: 'nav.cattle.all',
        icon: 'icon icon-globe',
        route: 'environments',
        ctx: [getProjectId],
        queryParams: {which: 'all'},
      },
      {divider: true},
      {
        id: 'cattle-user',
        localizedLabel: 'nav.cattle.user',
        icon: 'icon icon-layers',
        route: 'environments',
        ctx: [getProjectId],
        queryParams: {which: 'user'},
      },
      {
        id: 'cattle-system',
        localizedLabel: 'nav.cattle.system',
        icon: 'icon icon-network',
        route: 'environments',
        ctx: [getProjectId],
        queryParams: {which: 'system'},
      },
    ],
  },

  // Catalog
  {
    id: 'catalog',
    localizedLabel: 'nav.catalog.tab',
    route: 'catalog-tab',
    ctx: [getProjectId],
    condition: function() {
      return this.get('hasProject') &&
      this.get(`settings.${C.SETTING.CATALOG_URL}`);
    },
    submenu: getCatalogSubtree,
  },

  // Infrastructure
  {
    id: 'infra',
    localizedLabel: 'nav.infra.tab',
    route: 'infrastructure-tab',
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject'); },
    submenu: [
      {
        id: 'infra-hosts',
        localizedLabel: 'nav.infra.hosts',
        icon: 'icon icon-host',
        route: 'hosts',
        ctx: [getProjectId],
      },
      {
        id: 'infra-containers',
        localizedLabel: 'nav.infra.containers',
        icon: 'icon icon-box',
        route: 'containers',
        ctx: [getProjectId],
      },
      {
        id: 'infra-vms',
        localizedLabel: 'nav.infra.vms',
        icon: 'icon icon-vm',
        route: 'virtualmachines',
        ctx: [getProjectId],
        condition: function() { return this.get('hasVm'); },
      },
      {
        id: 'infra-storagepools',
        localizedLabel: 'nav.infra.storagePools',
        icon: 'icon icon-hdd',
        route: 'storagepools',
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
    ],
  },

  // Admin
  {
    id: 'admin',
    localizedLabel: 'nav.admin.tab',
    route: 'admin-tab',
    condition: function() { return this.get('isAdmin'); },
    alertRoute: 'admin-tab.auth',
    alertCondition: function() {
      return !this.get('access.enabled') && this.get('prefs.'+C.PREFS.ACCESS_WARNING) !== false;
    },
    submenu: [
      {
        id: 'admin-audit',
        localizedLabel: 'nav.admin.audit',
        icon: 'icon icon-folder-open',
        route: 'admin-tab.audit-logs',
      },
      {
        id: 'admin-processes',
        localizedLabel: 'nav.admin.processes',
        icon: 'icon icon-processes',
        route: 'admin-tab.processes',
      },
      {
        id: 'admin-accounts',
        localizedLabel: 'nav.admin.accounts',
        icon: 'icon icon-users',
        route: 'admin-tab.accounts',
      },
      {
        id: 'admin-access',
        localizedLabel: 'nav.admin.access',
        icon: 'icon icon-key',
        route: 'admin-tab.auth',
      },
      {
        id: 'admin-settings',
        localizedLabel: 'nav.admin.settings',
        icon: 'icon icon-network',
        route: 'admin-tab.settings',
      },
      {
        id: 'admin-ha',
        localizedLabel: 'nav.admin.ha',
        icon: 'icon icon-umbrella',
        route: 'admin-tab.ha',
      },
    ],
  },

  // API
  {
    id: 'api',
    localizedLabel: 'nav.api.tab',
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
      localizedLabel: 'nav.catalog.all',
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
      localizedLabel: 'nav.catalog.library',
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

