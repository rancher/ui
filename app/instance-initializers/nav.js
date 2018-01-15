import { getProjectId, getClusterId, bulkAdd } from 'ui/utils/navigation-tree';

const rootNav = [
  // Project
  {
    scope: 'project',
    id: 'containers',
    localizedLabel: 'nav.containers.tab',
    route: 'authenticated.project',
    ctx: [getProjectId],
    moreCurrentWhen: ['containers','ingresses',/*'dns',*/'volumes'],
    resource: ["workload", "ingress", "dnsrecord"],
  },

  {
    scope: 'project',
    id: 'project-apps',
    localizedLabel: 'nav.apps.tab',
    route: 'apps-tab',
    ctx: [getProjectId],
    resource: ["namespace"],
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
        route: 'authenticated.project.certificates',
        ctx: [getProjectId],
        resource: ["certificate"],
      },
      {
        id: 'infra-registries',
        localizedLabel: 'nav.infra.registries',
        icon: 'icon icon-database',
        route: 'authenticated.project.registries',
        ctx: [getProjectId],
        resource: ["dockercredential"],
      },
      {
        id: 'infra-secrets',
        localizedLabel: 'nav.infra.secrets',
        icon: 'icon icon-secrets',
        route: 'authenticated.project.secrets',
        ctx: [getProjectId],
        resource: ["namespacedsecret", "secret"],
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
    resource: ['machine'],
  },
  {
    scope: 'cluster',
    id: 'cluster-projects',
    localizedLabel: 'nav.cluster.projects',
    route: 'authenticated.cluster.projects.index',
    ctx: [getClusterId],
    resource: ['project'],
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
    resource: ['machine'],
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
    resource: ['cluster'],
  },
  {
    scope: 'global',
    id: 'global-machines',
    localizedLabel: 'nav.admin.machines',
    route: 'global-admin.machines',
    resource: ['machine'],
  },
  {
    scope: 'global',
    id: 'global-machine-drivers',
    localizedLabel: 'nav.admin.machineDrivers',
    route: 'global-admin.machine-drivers',
    resource: ['machinedriver'],
  },
  {
    scope: 'global',
    id: 'global-catalogs',
    localizedLabel: 'nav.admin.catalogs',
    route: 'global-admin.catalog',
    resource: ['catalog'],
  },
  {
    scope: 'global',
    id: 'global-accounts',
    localizedLabel: 'nav.admin.accounts',
    route: 'global-admin.accounts',
    resource: ['user'],
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
        resource: ['roletemplate'],
      },
      {
        id: 'global-security-roles',
        localizedLabel: 'nav.admin.security.podSecurityPolicies',
        icon: 'icon icon-files',
        route: 'global-admin.security.policies',
        resource: ['podsecuritypolicytemplate'],
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
