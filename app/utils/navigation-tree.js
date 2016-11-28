import Ember from 'ember';
import C from 'ui/utils/constants';
import { getCatalogNames } from 'ui/utils/parse-catalog-setting';
import { tagChoices } from 'ui/models/stack';
import { uniqKeys } from 'ui/utils/util';

// Useful context/condition shortcuts
export const getProjectId = function() { return this.get('projectId'); };
export const getNamespaceId = function() { return this.get('namespaceId'); };
export const k8sReady = function() { return this.get('kubernetesReady'); };
export const k8sNotReady = function() { return !this.get('kubernetesReady'); };
export const swarmReady = function() { return this.get('swarmReady'); };
export const swarmNotReady = function() { return !this.get('swarmReady'); };
export const mesosReady = function() { return this.get('mesosReady'); };
export const mesosNotReady = function() { return !this.get('mesosReady'); };
export const isOwner = function() { return this.get('isOwner'); };

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
    submenu: [
      {
        id: 'k8s-stacks',
        localizedLabel: 'nav.k8s.stacks',
        icon: 'icon icon-stacks',
        route: 'k8s-tab.namespace.stacks',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        id: 'k8s-deployments',
        localizedLabel: 'nav.k8s.deployments',
        icon: 'icon icon-tachometer',
        route: 'k8s-tab.namespace.deployments',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        id: 'k8s-services',
        localizedLabel: 'nav.k8s.services',
        icon: 'icon icon-compass',
        route: 'k8s-tab.namespace.services',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        divider: true,
        condition: k8sReady,
      },
      {
        id: 'k8s-replicasets',
        localizedLabel: 'nav.k8s.replicasets',
        icon: 'icon icon-services',
        route: 'k8s-tab.namespace.replicasets',
        ctx: [getProjectId, getNamespaceId],
        condition: k8sReady,
      },
      {
        id: 'k8s-rcs',
        localizedLabel: 'nav.k8s.rcs',
        icon: 'icon icon-services',
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
        id: 'k8s-notready',
        icon: 'icon icon-spinner icon-spin',
        localizedLabel: 'nav.notReady',
        condition: k8sNotReady,
      },
      {
        divider: true,
      },
      {
        id: 'k8s-system',
        localizedLabel: 'nav.k8s.system',
        icon: 'icon icon-network',
        route: 'stacks',
        condition: isOwner,
        ctx: [getProjectId],
        queryParams: {which: C.EXTERNAL_ID.KIND_NOT_ORCHESTRATION},
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
    moreCurrentWhen: ['stacks'],
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
        id: 'swarm-notready',
        icon: 'icon icon-spinner icon-spin',
        localizedLabel: 'nav.notReady',
        condition: swarmNotReady,
      },
      {
        id: 'swarm-system',
        localizedLabel: 'nav.swarm.system',
        icon: 'icon icon-network',
        route: 'stacks',
        condition: isOwner,
        ctx: [getProjectId],
        queryParams: {which: C.EXTERNAL_ID.KIND_NOT_ORCHESTRATION},
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
        id: 'mesos-notready',
        icon: 'icon icon-spinner icon-spin',
        localizedLabel: 'nav.notReady',
        condition: mesosNotReady,
      },
      {
        id: 'mesos-system',
        localizedLabel: 'nav.mesos.system',
        icon: 'icon icon-network',
        route: 'stacks',
        condition: isOwner,
        ctx: [getProjectId],
        queryParams: {which: C.EXTERNAL_ID.KIND_NOT_ORCHESTRATION},
      },
    ],
  },

  // Cattle
  {
    id: 'cattle',
    localizedLabel: 'nav.cattle.tab',
    route: 'stacks',
    queryParams: {which: C.EXTERNAL_ID.KIND_USER, tags: ''},
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject') && !this.get('hasKubernetes') && !this.get('hasSwarm') && !this.get('hasMesos'); },
    submenu: getStacksSubtree,
  },

  // Catalog
  {
    id: 'catalog',
    localizedLabel: 'nav.catalog.tab',
    route: 'catalog-tab',
    queryParams: {catalogId: 'all'},
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
        localizedLabel: 'nav.infra.storagePage',
        icon: 'icon icon-hdd',
        route: 'storagepools',
        ctx: [getProjectId],
      },
      /*
      {
        id: 'infra-backuptargets',
        localizedLabel: 'nav.infra.backupTarget',
        icon: 'icon icon-target',
        route: 'backuptargets',
        ctx: [getProjectId],
        condition: function() { return this.get('hasVm'); },
      },
      */
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

function getStacksSubtree() {
  let out = [
    {
      id: 'cattle-all',
      localizedLabel: 'nav.cattle.all',
      icon: 'icon icon-globe',
      route: 'stacks',
      ctx: [getProjectId],
      queryParams: {which: C.EXTERNAL_ID.KIND_ALL, tags: ''},
    },
    { divider: true },
    {
      id: 'cattle-user',
      localizedLabel: 'nav.cattle.user',
      icon: 'icon icon-layers',
      route: 'stacks',
      ctx: [getProjectId],
      queryParams: {which: C.EXTERNAL_ID.KIND_USER, tags: ''},
      condition: isOwner,
    },
    {
      id: 'cattle-infra',
      localizedLabel: 'nav.cattle.system',
      icon: 'icon icon-gear',
      route: 'stacks',
      ctx: [getProjectId],
      condition: isOwner,
      queryParams: {which: C.EXTERNAL_ID.KIND_INFRA, tags: ''},
    }
  ];

  let stacks = this.get('store').all('stack');
  let choices = uniqKeys(tagChoices(stacks)).sort();

  if ( choices.length ) {
    out.push({divider: true});

    choices.forEach((choice) => {
      out.push({
        id: 'cattle-tag-'+choice,
        label: choice,
        icon: 'icon icon-tag',
        route: 'stacks',
        ctx: [getProjectId],
        condition: isOwner,
        queryParams: {which: C.EXTERNAL_ID.KIND_ALL, tags: choice},
      });
    });
  }


  return out;
}

function getCatalogSubtree() {
  let repos = getCatalogNames(this.get(`settings.${C.SETTING.CATALOG_URL}`));
  let showAll = repos.length > 1;

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

    out.push({divider: true});
  }

  if (repos.indexOf(C.CATALOG.LIBRARY_KEY) >= 0 ) {
    repos.removeObject(C.CATALOG.LIBRARY_KEY);
    out.push({
      id: 'catalog-library',
      localizedLabel: 'nav.catalog.library',
      icon: 'icon icon-catalog',
      route: 'catalog-tab',
      ctx: [getProjectId],
      queryParams: {catalogId: 'library'}
    });
  }

  if (repos.indexOf(C.CATALOG.COMMUNITY_KEY) >= 0 ) {
    repos.removeObject(C.CATALOG.COMMUNITY_KEY);
    out.push({
      id: 'catalog-community',
      localizedLabel: 'nav.catalog.community',
      icon: 'icon icon-users',
      route: 'catalog-tab',
      ctx: [getProjectId],
      queryParams: {catalogId: 'community'}
    });
  }

  if ( out.length > 2 ) {
    out.push({divider: true});
  }

  repos.forEach((repo) => {
    out.push({
      id: 'catalog-'+repo,
      label: repo,
      icon: 'icon icon-user',
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
