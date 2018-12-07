import { observer } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { on } from '@ember/object/evented';

const GRAFANA_LINKS = [
  {
    id:    'etcd',
    title: 'Etcd'
  },
  {
    id:    'scheduler',
    title: 'Kubernetes Components'
  },
  {
    id:    'controller',
    title: 'Kubernetes Components'
  },
  {
    id:    'nodes',
    title: 'Nodes'
  },
  {
    id:    'k8s',
    title: 'Kubernetes Components'
  },
  {
    id:    'rancher',
    title: 'Rancher Components'
  },
];

export default Service.extend({
  scope:        service(),
  globalStore:  service(),

  grafanaLinks: GRAFANA_LINKS,
  dashboards:   null,

  updateLinks() {
    ( get(this, 'grafanaLinks') || [] ).forEach((link) => {
      const dashboards = get(this, 'dashboards') || [];
      const target = dashboards.findBy('title', get(link, 'title'));

      if ( target ) {
        const grafanaUrl = `${ get(this, 'scope.currentCluster.monitoringStatus.grafanaEndpoint') }${ get(target, 'url') }`;

        set(this, `${ get(link, 'id') }Url`, grafanaUrl);
      } else {
        set(this, `${ get(link, 'id') }Url`, null);
      }
    });
  },

  monitoringStatusDidChange: on('init', observer('scope.currentCluster.id', 'scope.currentProject.id', 'scope.currentCluster.isMonitoringReady', 'scope.currentProject.isMonitoringReady', function() {
    const found = get(this, 'globalStore').all('project').findBy('isSystemProject', true);

    set(this, 'dashboards', []);
    this.updateLinks();
    if ( found ) {
      const isClusterReady = get(this, 'scope.currentCluster.isMonitoringReady');

      if ( isClusterReady ) {
        const rootUrl = get(this, 'scope.currentCluster.monitoringStatus.grafanaEndpoint');

        get(this, 'globalStore').rawRequest({
          url:    `${ rootUrl }api/search`,
          method: 'GET',
        }).then((xhr) => {
          if (this.isDestroyed || this.isDestroying) {
            return;
          }

          const dashboards = xhr.body || [];

          set(this, 'dashboards', dashboards);
          this.updateLinks();
        });
      } else {
        set(this, 'dashboards', []);
        this.updateLinks();
      }
    } else {
      const isProjectReady = get(this, 'scope.currentProject.isMonitoringReady');

      if ( isProjectReady ) {
        const rootUrl = get(this, 'scope.currentProject.monitoringStatus.grafanaEndpoint');

        get(this, 'globalStore').rawRequest({
          url:    `${ rootUrl }api/search`,
          method: 'GET',
        }).then((xhr) => {
          if (this.isDestroyed || this.isDestroying) {
            return;
          }

          const dashboards = xhr.body || [];

          set(this, 'dashboards', dashboards);
        });
      } else {
        set(this, 'dashboards', []);
      }
    }
  })),
});
