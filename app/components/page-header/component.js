import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseCatalogSetting } from 'ui/utils/parse-catalog-setting';

/* Tree item options
  {
    label: 'Displayed label', (or functiont that returns string)
    icon: 'icon icon-somethign',
    condition: function() { return true if this item should be displayed },
    url: 'http://any/url', (url or route required)
    target: '_blank', (for url only)
    route: 'target.route.path',
    ctx: ['values', 'asContextToRoute', orFunctionThatReturnsValue, anotherFunction]
    queryParams: {a: 'hello', b: 'world'],

    submenu: [
      // Another tree item (only one level of submenu supported, no arbitrary depth nesting)
    ]
  },
*/

export const getProjectId = function() { return this.get('projectId'); };
export const getNamespaceId = function() { return this.get('projectId'); };

const navTree = [
  {
    label: 'Kubernetes',
    route: 'k8s-tab',
    ctx: [getProjectId],
    condition: function() { return this.get('showKubernetes'); },
    submenu: [
      {
        label: 'Services',
        icon: 'icon icon-compass',
        route: 'k8s-tab.namespace.services',
        ctx: [getProjectId, getNamespaceId],
        condition: function() { return this.hasNamespace(); },
      },
      {
        label: 'Replication Controllers',
        icon: 'icon icon-tachometer',
        route: 'k8s-tab.namespace.rcs',
        ctx: [getProjectId, getNamespaceId],
        condition: function() { return this.hasNamespace(); },
      },
      {
        label: 'Pods',
        icon: 'icon icon-containers',
        route: 'k8s-tab.namespace.pods',
        ctx: [getProjectId, getNamespaceId],
        condition: function() { return this.hasNamespace(); },
      },
      {
        label: 'Kubectl',
        icon: 'icon icon-terminal',
        route: 'k8s-tab.kubectl',
        ctx: [getProjectId],
        condition: function() { return this.hasNamespace(); },
      },
    ],
  },

  {
    label: 'Swarm',
    condition: function() { return this.get('hasProject') && this.get('hasSwarm'); },
    route: 'swarm-tab',
    ctx: [getProjectId],
    submenu: [
      {
        label: 'Projects',
        icon: 'icon icon-layeredgroup',
        route: 'swarm-tab.projects',
        ctx: [getProjectId],
        condition: function() { return this.get('swarmReady'); },
      },
      {
        label: 'Services',
        icon: 'icon icon-layers',
        route: 'swarm-tab.services',
        ctx: [getProjectId],
        condition: function() { return this.get('swarmReady'); },
      },
      {
        label: 'CLI',
        icon: 'icon icon-terminal',
        route: 'swarm-tab.console',
        ctx: [getProjectId],
        condition: function() { return this.get('swarmReady'); },
      },
    ]
  },

  // Cattle Stacks
  {
    label: 'Stacks',
    route: 'environments',
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject') && !this.get('showKubernetes') && !this.get('hasSwarm'); },
  },

  // Cattle System
  {
    label: 'System',
    route: 'environments',
    ctx: [getProjectId],
    queryParams: {which: 'system'},
    condition: function() {
      return this.get('hasProject') &&
      this.get('hasSystem') &&
      !this.get('showKubernetes') &&
      !this.get('hasSwarm');
    },
  },

  // K8s System
  {
    label: 'System',
    route: 'environments',
    ctx: [getProjectId],
    queryParams: {which: 'not-kubernetes'},
    condition: function() {
      return this.get('hasProject') &&
      this.get('showKubernetes');
    },
  },

  // Swarm System
  {
    label: 'System',
    route: 'environments',
    ctx: [getProjectId],
    queryParams: {which: 'not-swarm'},
    condition: function() { return this.get('hasProject') && this.get('hasSwarm'); },
  },

  {
    label: 'Catalog',
    route: 'catalog-tab',
    ctx: [getProjectId],
    condition: function() {
      return this.get('hasProject') &&
      this.get(`settings.${C.SETTING.CATALOG_URL}`) &&
      (!this.get('hasSwarm') || this.get('swarmReady')) &&
      (!this.get('showKubernetes') || this.hasNamespace());
    },
    submenu: getCatalogSubtree,
  },

  {
    label: 'Infrastructure',
    route: 'infrastructure-tab',
    ctx: [getProjectId],
    condition: function() {
      return this.get('hasProject') &&
      this.get(`settings.${C.SETTING.CATALOG_URL}`) &&
      (!this.get('hasSwarm') || this.get('swarmReady')) &&
      (!this.get('showKubernetes') || this.hasNamespace());
    },
    submenu: [
      {
        label: 'Hosts',
        icon: 'icon icon-host',
        route: 'hosts',
        ctx: [getProjectId],
      },
      {
        label: 'Containers',
        icon: 'icon icon-box',
        route: 'containers',
        ctx: [getProjectId],
      },
      {
        label: 'Virtual Machines',
        icon: 'icon icon-vm',
        route: 'virtualmachines',
        ctx: [getProjectId],
        condition: function() { return this.get('hasVm'); },
      },
      {
        label: 'Storage Pools',
        icon: 'icon icon-hdd',
        route: 'storagepools',
        ctx: [getProjectId],
      },
      {
        label: 'Certificates',
        icon: 'icon icon-certificate',
        route: 'certificates',
        ctx: [getProjectId],
      },
      {
        label: 'Registries',
        icon: 'icon icon-database',
        route: 'registries',
        ctx: [getProjectId],
      },
    ],
  },

  {
    label: 'Admin',
    route: 'admin-tab',
    condition: function() { return this.get('isAdmin'); },
    submenu: [
      {
        label: 'Audit Log',
        icon: 'icon icon-folder-open',
        route: 'admin-tab.audit-logs',
      },
      {
        label: 'Processes',
        icon: 'icon icon-processes',
        route: 'admin-tab.processes',
      },
      {
        label: 'Accounts',
        icon: 'icon icon-users',
        route: 'admin-tab.accounts',
      },
      { divider: true },
      {
        label: 'Access Control',
        icon: 'icon icon-key',
        route: 'admin-tab.auth',
      },
      {
        label: 'Settings',
        icon: 'icon icon-network',
        route: 'admin-tab.settings',
      },
      {
        label: 'High-Availability',
        icon: 'icon icon-umbrella',
        route: 'admin-tab.ha',
      },
    ],
  },

  {
    label: 'API',
    icon: 'icon icon-terminal',
    route: 'authenticated.project.apikeys',
    ctx: [getProjectId],
    condition: function() { return this.get('hasProject'); },
  }
];


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
    out.push({label: 'All', icon: 'icon icon-globe', route: 'catalog-tab', ctx: [getProjectId], queryParams: {catalogId: 'all'}});
  }

  if ( showLibrary ) {
    if ( showAll ) {
      out.push({divider: true});
    }
    out.push({label: 'Library', icon: 'icon icon-catalog', route: 'catalog-tab', ctx: [getProjectId], queryParams: {catalogId: 'library'}});
  }

  repos.forEach((repo) => {
    out.push({label: repo, icon: 'icon icon-users', route: 'catalog-tab', ctx: [getProjectId], queryParams: {catalogId: repo}});
  });


  if ( out.length === 1 ) {
    return [];
  } else {
    return out;
  }
}

export default Ember.Component.extend({
  // Inputs
  currentPath: null,
  hasKubernetes: null,
  hasSwarm: null,
  swarmReady: null,
  hasSystem: null,
  hasVm: null,

  // Injections
  projects         : Ember.inject.service(),
  project          : Ember.computed.alias('projects.current'),
  k8s              : Ember.inject.service(),
  namespace        : Ember.computed.alias('k8s.namespace'),
  projectId        : Ember.computed.alias(`tab-session.${C.TABSESSION.PROJECT}`),
  namespaceId      : Ember.computed.alias('k8s.namespace.id'),
  settings         : Ember.inject.service(),
  access           : Ember.inject.service(),
  isAdmin          : Ember.computed.alias('access.admin'),

  // Component options
  tagName          : 'header',
  classNames       : ['clearfix','no-select'],

  actions: {
    switchProject(id) {
      this.sendAction('switchProject', id);
    },

    switchNamespace(id) {
      this.sendAction('switchNamespace', id);
    },
  },

  // This computed property generates the active list of choices to display
  navTree: function() {
    return navTree.map((item) => {
      return Ember.copy(item,true);
    }).filter((item) => {
      if ( typeof item.condition === 'function' )
      {
        if ( !item.condition.call(this) )
        {
          return false;
        }
      }

      if ( typeof item.label === 'function' )
      {
        item.label = item.label.call(this);
      }

      if ( typeof item.route === 'function' )
      {
        item.route = item.route.call(this);
      }

      item.ctx = (item.ctx||[]).map((ctx) => {
        if ( typeof ctx === 'function' )
        {
          return ctx.call(this);
        }
        else
        {
          return ctx;
        }
      });

      if ( typeof item.submenu === 'function' )
      {
        item.submenu = item.submenu.call(this);
      }

      item.submenu = (item.submenu||[]).filter((subitem) => {
        if ( typeof subitem.condition === 'function' )
        {
          return subitem.condition.call(this);
        }

        return true;
      });

      return true;
    });
  }.property('currentPath','showKubernetes','hasSwarm','swarmReady','hasSystem','hasVm','projectId','namespaceId',`settings.${C.SETTING.CATALOG_URL}`,'isAdmin'),

  // Utilities you can use in the condition() function to decide if an item is shown or hidden,
  // beyond things listed in "Inputs"
  pathIs(prefix) {
    return this.get('currentPath').indexOf(prefix) === 0;
  },

  hasProject: function() {
    return !!this.get('project');
  }.property('project'),

  showKubernetes: function() {
    return this.get('hasKubernetes') || this.pathIs('authenticated.project.k8s-tab');
  }.property('hasKubernetes','currentPath'),

  hasNamespace() {
    return this.get('showKubernetes') && this.get('namespaceId');
  }
});
