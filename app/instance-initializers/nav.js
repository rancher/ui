import { getProjectId, getClusterId, bulkAdd } from 'ui/utils/navigation-tree';

const rootNav = [
  // Project
  {
    scope: 'project',
    id: 'containers',
    localizedLabel: 'nav.containers.tab',
    route: 'authenticated.project.index',
    ctx: [getProjectId],
    moreCurrentWhen: ['containers','balancers','dns','volumes'],
  },

  {
    scope: 'project',
    id: 'project-apps',
    localizedLabel: 'nav.apps.tab',
    route: 'apps-tab',
    ctx: [getProjectId],
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
    id: 'cluster-k8s',
    localizedLabel: 'nav.cluster.dashboard',
    route: 'authenticated.cluster.index',
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-projects',
    localizedLabel: 'nav.cluster.projects',
    route: 'authenticated.cluster.projects.index',
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-namespaces',
    localizedLabel: 'nav.cluster.namespaces',
    route: 'authenticated.cluster.ns.index',
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-nodes',
    localizedLabel: 'nav.cluster.nodes',
    route: 'authenticated.cluster.nodes',
    ctx: [getClusterId],
  },
//  {
//    scope: 'cluster',
//    id: 'cluster-networking',
//    localizedLabel: 'nav.cluster.networking',
//    route: 'authenticated.cluster.networking',
//    ctx: [getClusterId],
//  },
//  {
//    scope: 'cluster',
//    id: 'cluster-storage',
//    localizedLabel: 'nav.cluster.storage',
//    route: 'authenticated.cluster.storage',
//    ctx: [getClusterId],
//  },

  // Global
  {
    scope: 'global',
    id: 'global-clusters',
    localizedLabel: 'nav.admin.clusters',
    route: 'global-admin.clusters',
  },
  {
    scope: 'global',
    id: 'global-machines',
    localizedLabel: 'nav.admin.machines',
    route: 'global-admin.machines',
  },
  {
    scope: 'global',
    id: 'global-machine-drivers',
    localizedLabel: 'nav.admin.machineDrivers',
    route: 'global-admin.machine-drivers',
  },
  {
    scope: 'global',
    id: 'global-catalogs',
    localizedLabel: 'nav.admin.catalogs',
    route: 'global-admin.catalog',
  },
  {
    scope: 'global',
    id: 'global-accounts',
    localizedLabel: 'nav.admin.accounts',
    route: 'global-admin.accounts',
  },
  {
    scope: 'global',
    id: 'global-security',
    localizedLabel: 'nav.admin.security.tab',
    route: 'global-admin.security',
    submenu: [
      {
        id: 'global-security-roles',
        localizedLabel: 'nav.admin.security.roles',
        icon: 'icon icon-key',
        route: 'global-admin.security.roles',
      },
      {
        id: 'global-security-roles',
        localizedLabel: 'nav.admin.security.podSecurityPolicies',
        icon: 'icon icon-files',
        route: 'global-admin.security.policies',
      },
      {
        id: 'global-security-authentication',
        localizedLabel: 'nav.admin.security.authentication',
        icon: 'icon icon-users',
        route: 'global-admin.security.authentication',
      },
    ],
  },
//  {
//    scope: 'global',
//    id: 'global-advanced',
//    localizedLabel: 'nav.admin.settings.advanced',
//    route: 'global-admin.settings.advanced',
//    disabled: true,
//  },
]

export function initialize(/*appInstance*/) {
  bulkAdd(rootNav);
}

export default {
  name: 'nav',
  initialize: initialize,
  after: 'store',
};
