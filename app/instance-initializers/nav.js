import {
  getProjectId,
  getClusterId,
  bulkAdd
} from 'ui/utils/navigation-tree';
import { get } from '@ember/object';

const rootNav = [
  // Project
  {
    scope:          'project',
    id:             'infra',
    localizedLabel: 'nav.infra.tab',
    ctx:            [getProjectId],
    submenu:        [
      {
        id:             'containers',
        localizedLabel: 'nav.containers.tab',
        route:          'authenticated.project.index',
        ctx:            [getProjectId],
        resource:       ['workload', 'ingress', 'service'],
        resourceScope:  'project',
        currentWhen:    [
          'containers',
          'workload',
          'ingresses',
          'authenticated.project.dns',
          'volumes',
        ],
      },
      {
        id:             'hpa',
        localizedLabel: 'nav.infra.hpa',
        route:          'authenticated.project.hpa',
        ctx:            [getProjectId],
        resource:       ['horizontalpodautoscaler'],
        resourceScope:  'project',
      },
      {
        id:             'infra-secrets',
        localizedLabel: 'nav.infra.secrets',
        route:          'authenticated.project.secrets',
        ctx:            [getProjectId],
        resource:       ['namespacedsecret', 'secret', 'dockercredential', 'certificate'],
        resourceScope:  'project',
        currentWhen:    [
          'authenticated.project.certificates',
          'authenticated.project.registries',
          'authenticated.project.secrets',
        ],
      },
      {
        id:             'infra-config-maps',
        localizedLabel: 'nav.infra.configMaps',
        route:          'authenticated.project.config-maps',
        ctx:            [getProjectId],
        resource:       ['configmap'],
        resourceScope:  'project',
      },
    ],
  },
  {
    scope:          'project',
    id:             'project-apps',
    localizedLabel: 'nav.apps.tab',
    route:          'apps-tab',
    ctx:            [getProjectId],
    resource:       ['app'],
    resourceScope:  'project',
  },
  {
    scope:          'project',
    id:             'namespaces',
    localizedLabel: 'nav.project.namespaces',
    route:          'authenticated.project.ns.index',
    ctx:            [getProjectId],
    resource:       ['namespace'],
    resourceScope:  'cluster',
  },
  {
    scope:          'project',
    id:             'project-security-roles',
    localizedLabel: 'nav.infra.members',
    route:          'authenticated.project.security.members',
    resource:       ['projectroletemplatebinding'],
    resourceScope:  'global',
    ctx:            [getProjectId],
  },
  {
    scope:          'project',
    id:             'project-tools',
    localizedLabel: 'nav.tools.tab',
    ctx:            [getProjectId],
    resource:       [],
    resourceScope:  'global',
    submenu:        [
      {
        id:             'manage-catalogs',
        localizedLabel: 'nav.tools.catalogs',
        route:          'authenticated.project.project-catalogs',
        ctx:            [getProjectId],
        resource:       ['catalog', 'project-catalog'],
        resourceScope:  'global',
      },
      {
        id:             'tools-pipeline',
        localizedLabel: 'nav.tools.pipeline',
        route:          'authenticated.project.pipeline.settings',
        resource:       ['sourcecodeproviderconfig'],
        resourceScope:  'project',
        ctx:            [getProjectId],
      },
    ]
  },
  // Cluster
  {
    scope:          'cluster',
    id:             'cluster-k8s',
    localizedLabel: 'nav.cluster.dashboard',
    route:          'authenticated.cluster.monitoring.index',
    ctx:            [getClusterId],
    resource:       ['node'],
    resourceScope:  'global',
  },
  {
    scope:          'cluster',
    id:             'cluster-nodes',
    localizedLabel: 'nav.cluster.nodes',
    route:          'authenticated.cluster.nodes',
    ctx:            [getClusterId],
    resource:       ['node'],
    resourceScope:  'global',
  },
  {
    scope:          'cluster',
    id:             'cluster-storage',
    localizedLabel: 'nav.cluster.storage.tab',
    ctx:            [getClusterId],
    resource:       ['clusterroletemplatebinding'],
    resourceScope:  'global',
    submenu:        [
      {
        scope:          'cluster',
        id:             'cluster-storage-volumes',
        localizedLabel: 'nav.cluster.storage.volumes',
        route:          'authenticated.cluster.storage.persistent-volumes.index',
        ctx:            [getClusterId],
        resource:       ['project'],
        resourceScope:  'global',
      },
      {
        scope:          'cluster',
        id:             'cluster-storage-classes',
        localizedLabel: 'nav.cluster.storage.classes',
        route:          'authenticated.cluster.storage.classes.index',
        ctx:            [getClusterId],
        resource:       ['project'],
        resourceScope:  'global',
      },
    ]
  },
  {
    scope:          'cluster',
    id:             'cluster-projects',
    localizedLabel: 'nav.cluster.projects',
    route:          'authenticated.cluster.projects.index',
    ctx:            [getClusterId],
    resource:       ['project'],
    resourceScope:  'global',
  },
  {
    scope:          'cluster',
    id:             'cluster-security-roles',
    localizedLabel: 'nav.cluster.members',
    route:          'authenticated.cluster.security.members.index',
    resource:       ['clusterroletemplatebinding'],
    resourceScope:  'global',
    ctx:            [getClusterId],
  },
  {
    scope:          'cluster',
    id:             'cluster-tools',
    localizedLabel: 'nav.tools.tab',
    ctx:            [getClusterId],
    resource:       [],
    resourceScope:  'global',
    submenu:        [
      {
        id:             'cluster-tools-backups',
        localizedLabel: 'nav.tools.backups',
        route:          'authenticated.cluster.backups',
        resourceScope:  'global',
        resource:       ['etcdbackup'],
        ctx:            [getClusterId],
        condition() {
          return get(this, 'cluster.rancherKubernetesEngineConfig')
        }
      },
      {
        scope:          'cluster',
        id:             'cluster-catalogs',
        localizedLabel: 'nav.admin.catalogs',
        route:          'authenticated.cluster.cluster-catalogs',
        ctx:            [getClusterId],
        resource:       ['catalog', 'cluster-catalog'],
        resourceScope:  'global',
      },
      { divider: true },
      {
        id:                       'cluster-tools-backup',
        localizedLabel:           'nav.tools.backup',
        dashboardLink:            '/backup',
        condition() {
          return get(this, 'cluster.id') === 'local';
        }
      },
      {
        id:                       'cluster-tools-gatekeeper',
        localizedLabel:           'nav.tools.gatekeeper',
        dashboardLink:            '/gatekeeper',
      },
    ],
  },

  // Global
  {
    scope:          'global',
    id:             'global-clusters',
    localizedLabel: 'nav.admin.clusters.tab',
    route:          'global-admin.clusters',
    resource:       ['cluster'],
    resourceScope:  'global',
  },
  {
    scope:          'global',
    id:             'global-settings',
    localizedLabel: 'nav.settings.tab',
    route:          'global-admin.settings.advanced',
    resourceScope:  'global',
  },
  {
    scope:          'global',
    id:             'global-security',
    localizedLabel: 'nav.admin.security.tab',
    submenu:        [
      {
        scope:          'global',
        id:             'global-accounts',
        localizedLabel: 'nav.admin.security.accounts',
        route:          'global-admin.security.accounts.users',
        resource:       ['user'],
        resourceScope:  'global',
      },
      {
        scope:          'global',
        id:             'global-group-accounts',
        localizedLabel: 'nav.admin.security.groupAccounts',
        route:          'global-admin.security.accounts.groups',
        resource:       ['globalrolebinding'],
        resourceScope:  'global',
      },
      {
        id:             'global-security-roles',
        localizedLabel: 'nav.admin.security.roles',
        route:          'global-admin.security.roles.index',
        resource:       ['roletemplate'],
        resourceScope:  'global',
      },
      {
        id:             'global-security-authentication',
        localizedLabel: 'nav.admin.security.authentication',
        route:          'global-admin.security.authentication',
        condition() {
          const authConfigs = this.globalStore.all('authConfig');

          return authConfigs.get('length') > 0;
        }
      },
    ],
  },
  {
    scope:          'global',
    id:             'global-tools',
    localizedLabel: 'nav.tools.tab',
    submenu:        [
      {
        scope:          'global',
        id:             'global-catalogs',
        localizedLabel: 'nav.admin.catalogs',
        route:          'global-admin.catalog',
        resource:       ['catalog'],
        resourceScope:  'global',
      },
      {
        scope:          'global',
        id:             'nodes-node-drivers',
        localizedLabel: 'nav.admin.drivers',
        route:          'nodes.custom-drivers',
        resource:       ['nodedriver', 'kontainerdriver'],
        resourceScope:  'global',
      },
      {
        id:             'global-dns-entries',
        localizedLabel: 'nav.admin.globalDnsEntries',
        route:          'global-admin.global-dns.entries',
        resource:       ['globaldns'],
        resourceScope:  'global',
      },
      {
        id:             'global-dns-providers',
        localizedLabel: 'nav.admin.globalDnsProviders',
        route:          'global-admin.global-dns.providers',
        resource:       ['globaldnsprovider'],
        resourceScope:  'global',
      },
      // {
      //   id:             'global-registry',
      //   localizedLabel: 'nav.admin.globalRegistry',
      //   route:          'global-admin.global-registry',
      //   // There is no schema for global registry. But we can use global dns to check if it is a HA env.
      //   resource:       ['globaldns'],
      //   resourceScope:  'global',
      // },
      {
        id:             'rke-template',
        localizedLabel: 'nav.admin.clusters.rkeTemplate',
        route:          'global-admin.cluster-templates',
        resource:       ['clustertemplate'],
        resourceScope:  'global',
      },
      { divider: true },
      {
        id:                'tools-fleet',
        localizedLabel:    'nav.tools.fleet',
        dashboardBaseLink:  '/c/local/fleet',
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

export function initialize(/* appInstance*/) {
  bulkAdd(rootNav);
}

export default {
  name:       'nav',
  initialize,
  after:      'store',
};
