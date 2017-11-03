import PageHeader from 'shared/components/page-header/component';
import {getProjectId, getClusterId, bulkAdd} from 'ui/utils/navigation-tree';
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
    id: 'project-hosts',
    localizedLabel: 'nav.hosts.tab',
    route: 'hosts',
    ctx: [getProjectId],
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
    id: 'cluster-hosts',
    localizedLabel: 'nav.cluster.hosts',
    route: 'authenticated.clusters.cluster.hosts',
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-k8s',
    localizedLabel: 'nav.cluster.k8s',
    route: 'authenticated.clusters.cluster.k8s',
    condition: function() { return this.get(`cluster.isKubernetes`); },
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-networking',
    localizedLabel: 'nav.cluster.networking',
    route: 'authenticated.clusters.cluster.networking',
    ctx: [getClusterId],
  },
  {
    scope: 'cluster',
    id: 'cluster-storage',
    localizedLabel: 'nav.cluster.storage',
    route: 'authenticated.clusters.cluster.storage',
    ctx: [getClusterId],
  },
]

export default PageHeader.extend({
  init() {
    bulkAdd(rootNav);
    this._super(...arguments);
  }
});
