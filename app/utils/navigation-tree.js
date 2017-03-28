import Ember from 'ember';
import C from 'ui/utils/constants';

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
  },

  // Swarm
  {
    id: 'swarm',
    localizedLabel: 'nav.swarm.tab',
    condition: function() { return this.get('hasProject') && this.get('hasSwarm'); },
    route: 'swarm-tab',
    ctx: [getProjectId],
    submenu: [
      {
        id: 'swarm-cli',
        localizedLabel: 'nav.swarm.cli',
        icon: 'icon icon-terminal',
        route: 'swarm-tab.console',
        ctx: [getProjectId],
        condition: swarmReady,
      },
      {
        id: 'swarm-dashboard',
        localizedLabel: 'nav.swarm.dashboard',
        icon: 'icon icon-link',
        route: 'swarm-tab.dashboard',
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
        route: 'scaling-groups',
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
        route: 'scaling-groups',
        condition: isOwner,
        ctx: [getProjectId],
        queryParams: {which: C.EXTERNAL_ID.KIND_NOT_ORCHESTRATION},
      },
    ],
  },

  // Cattle
  {
    id: 'containers',
    localizedLabel: function() {
      if ( this.get('hasKubernetes') || this.get('hasMesos') || this.get('hasSwarm') ) {
        return 'nav.containers.systemTab';
      } else {
        return 'nav.containers.tab';
      }
    },
    route: 'authenticated.project.index',
    ctx: [getProjectId],
    moreCurrentWhen: ['containers','scaling-groups','balancers','dns'],
  },

  {
    id: 'hosts',
    localizedLabel: 'nav.hosts.tab',
    route: 'hosts',
    ctx: [getProjectId],
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

  // Infrastructure
  {
    id: 'infra',
    localizedLabel: 'nav.infra.tab',
    route: 'infrastructure-tab',
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject'); },
    submenu: [
      {
        id: 'infra-storagepools',
        localizedLabel: 'nav.infra.storagePage',
        icon: 'icon icon-hdd',
        route: 'storagepools',
        ctx: [getProjectId],
      },
      {
        id: 'infra-secrets',
        localizedLabel: 'nav.infra.secrets',
        icon: 'icon icon-secrets',
        route: 'secrets',
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
      {
        id: 'infra-keys',
        localizedLabel: 'nav.infra.keys',
        icon: 'icon icon-key',
        route: 'authenticated.project.api.keys',
        ctx: [getProjectId],
      },
      {
        id: 'infra-hooks',
        localizedLabel: 'nav.infra.hooks',
        icon: 'icon icon-link',
        route: 'authenticated.project.api.hooks',
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
        id: 'admin-ha',
        localizedLabel: 'nav.admin.ha',
        icon: 'icon icon-umbrella',
        route: 'admin-tab.ha',
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
