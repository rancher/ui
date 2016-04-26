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
    context: ['values', 'asContextToRoute', orFunctionThatReturnsValue, anotherFunction]
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
    context: ['projectId'],
    condition: function() { return this.hasK8s() || this.pathIs('authenticated.project.k8s-tab'); },
    submenu: [
      {
        label: 'Services',
        icon: 'icon icon-compass',
        route: 'k8s-tab.namespace.services',
        context: [getProjectId, getNamespaceId],
        condition: function() { return this.hasNamespace(); },
      },
      {
        label: 'Replication Controllers',
        icon: 'icon icon-tachometer',
        route: 'k8s-tab.namespace.rcs',
        context: [getProjectId, getNamespaceId],
        condition: function() { return this.hasNamespace(); },
      },
      {
        label: 'Pods',
        icon: 'icon icon-containers',
        route: 'k8s-tab.namespace.pods',
        context: [getProjectId, getNamespaceId],
        condition: function() { return this.hasNamespace(); },
      },
      {
        label: 'Kubectl',
        icon: 'icon icon-terminal',
        route: 'k8s-tab.kubectl',
        context: [getProjectId],
        condition: function() { return this.hasNamespace(); },
      },
    ],
  },

  {
    label: 'Swarm',
    condition: function() { return this.get('hasSwarm') && this.hasProject(); },
    route: 'applications-tab',
    context: [getProjectId],
    submenu: [
      {
        label: 'Projects',
        icon: 'icon icon-layeredgroup',
        route: 'applications-tab.compose-projects',
        context: [getProjectId],
        condition: function() { return this.get('swarmReady'); },
      },
      {
        label: 'Services',
        icon: 'icon icon-layers',
        route: 'applications-tab.compose-services',
        context: [getProjectId],
        condition: function() { return this.get('swarmReady'); },
      },
      {
        label: 'CLI',
        icon: 'icon icon-terminal',
        route: 'applications-tab.compose-console',
        context: [getProjectId],
        condition: function() { return this.get('swarmReady'); },
      },
    ]
  },

  {
    label: 'Applications',
    route: 'applications-tab',
    context: ['projectId'],
    condition: function() { return !this.get('hasKubernetes') && !this.get('hasSwarm') && this.hasProject(); },
    submenu: [
      {
        label: 'Stacks',
        icon: 'icon icon-layers',
        route: 'environments',
        context: [getProjectId],
        queryParams: {which: 'user'},
      },
      {
        label: 'System',
        icon: 'icon icon-network',
        route: 'environments',
        context: [getProjectId],
        queryParams: {which: 'system'},
      },
    ]
  },

  {
    label: 'System',
    route: 'environments',
    context: [getProjectId],
    queryParams: {which: 'not-kubernetes'},
    condition: function() { return this.get('hasKubernetes') && this.hasProject(); },
  },

  {
    label: 'System',
    route: 'environments',
    context: [getProjectId],
    queryParams: {which: 'not-swarm'},
    condition: function() { return this.get('hasSwarm') && this.hasProject(); },
  },

  {
    label: 'Catalog',
    route: 'catalog-tab',
    context: [getProjectId],
    condition: function() {
      return this.hasProject() &&
      this.get(`settings.${C.SETTING.CATALOG_URL}`) &&
      (!this.get('hasSwarm') || this.get('swarmReady')) &&
      (!this.get('hasKubernetes') || this.hasNamespace());
    },
    submenu: getCatalogSubtree,
  },

  {
    label: 'Infrastructure',
    route: 'infrastructure-tab',
    context: [getProjectId],
    condition: function() {
      return this.hasProject() &&
      this.get(`settings.${C.SETTING.CATALOG_URL}`) &&
      (!this.get('hasSwarm') || this.get('swarmReady')) &&
      (!this.get('hasKubernetes') || this.hasNamespace());
    },
    submenu: [
      {
        label: 'Hosts',
        icon: 'icon icon-host',
        route: 'hosts',
        context: [getProjectId],
      },
      {
        label: 'Containers',
        icon: 'icon icon-box',
        route: 'containers',
        context: [getProjectId],
      },
      {
        label: 'Virtual Machines',
        icon: 'icon icon-vm',
        route: 'virtualmachines',
        context: [getProjectId],
        condition: function() { return this.get('hasVm'); },
      },
      {
        label: 'Storage Pools',
        icon: 'icon icon-hdd',
        route: 'storagepools',
        context: [getProjectId],
      },
      {
        label: 'Certificates',
        icon: 'icon icon-certificate',
        route: 'certificates',
        context: [getProjectId],
      },
      {
        label: 'Registries',
        icon: 'icon icon-database',
        route: 'registries',
        context: [getProjectId],
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
    context: [getProjectId],
    condition: function() { return this.hasProject(); },
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
    out.push({label: 'All', icon: 'icon icon-globe', route: 'catalog-tab', context: [getProjectId], queryParams: {catalogId: 'all'}});
  }

  if ( showLibrary ) {
    out.push({label: 'Library', icon: 'icon icon-catalog', route: 'catalog-tab', context: [getProjectId], queryParams: {catalogId: 'library'}});
  }

  if ( (showAll || showLibrary) && repos.length ) {
    out.push({divider: true});
  }

  repos.forEach((repo) => {
    out.push({label: repo, icon: 'icon icon-users', route: 'catalog-tab', context: [getProjectId], queryParams: {catalogId: repo}});
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

      item.context = (item.context||[]).map((ctx) => {
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
  }.property('currentPath','hasKubernetes','hasSwarm','swarmReady','hasSystem','hasVm','projectId','namespaceId',`settings.${C.SETTING.CATALOG_URL}`,'isAdmin'),

  // Utilities you can use in the condition() function to decide if an item is shown or hidden,
  // beyond things listed in "Inputs"
  pathIs(prefix) {
    return this.get('currentPath').indexOf(prefix) === 0;
  },

  hasProject() {
    return !!this.get('project');
  },

  hasK8s() {
    return this.get('hasKubernetes') || this.pathIs('authenticated.project.k8s-tab');
  },

  hasNamespace() {
    return this.get('hasK8s') && this.get('namespaceId');
  }
});
