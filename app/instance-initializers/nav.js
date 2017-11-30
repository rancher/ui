import { getProjectId, getClusterId, bulkAdd } from 'ui/utils/navigation-tree';
import C from 'shared/utils/constants';

const rootNav = [
  //project
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
    id: 'cluster-hosts',
    localizedLabel: 'nav.cluster.hosts',
    route: 'authenticated.cluster.hosts',
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-networking',
    localizedLabel: 'nav.cluster.networking',
    route: 'authenticated.cluster.networking',
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-storage',
    localizedLabel: 'nav.cluster.storage',
    route: 'authenticated.cluster.storage',
    ctx: [getClusterId],
  },

  // Global
  {
    scope: 'global',
    id: 'global-clusters',
    localizedLabel: 'nav.admin.clusters',
    route: 'global-admin.clusters',
  },
  {
    scope: 'global',
    id: 'global-accounts',
    localizedLabel: 'nav.admin.accounts',
    route: 'global-admin.accounts',
  },
  {
    scope: 'global',
    id: 'global-machines',
    localizedLabel: 'nav.admin.machines',
    route: 'global-admin.machines',
  },
  {
    scope: 'global',
    id: 'global-roles',
    localizedLabel: 'nav.admin.roles',
    route: 'global-admin.roles',
  },
  {
    scope: 'global',
    id: 'global-podsecurity',
    localizedLabel: 'nav.admin.podSecurityPolicies',
    route: 'global-admin.policies',
  },
  {
    scope: 'global',
    id: 'global-advanced',
    localizedLabel: 'nav.admin.settings.advanced',
    route: 'global-admin.settings.advanced',
  },
]

export function initialize(/*appInstance*/) {
  bulkAdd(rootNav);
}

export default {
  name: 'nav',
  initialize: initialize,
  after: 'store',
};
