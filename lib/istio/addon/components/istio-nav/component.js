import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from './template';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
  scope:   service(),
  grafana: service(),

  layout,

  cluster:          alias('scope.currentCluster'),
  project:          alias('scope.currentProject'),
  pageScope:        alias('scope.currentPageScope'),

  kialiUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:kiali-http:80/proxy/`
  }),

  jaegerUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:tracing:80/proxy/jaeger/search`
  }),

  grafanaUrl: computed('cluster.id', 'project.id', function() {
    if (get(this, 'pageScope') === 'cluster') {
      return get(this, 'grafana.istioUrl')
    } else if (get(this, 'pageScope') === 'project') {
      if (get(this, 'grafana.istioUrl')) {
        return get(this, 'grafana.istioUrl')
      } else {
        return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/cattle-prometheus-${ (get(this, 'project.id') || '').split(':').get('lastObject') }/services/http:access-grafana:80/proxy/`
      }
    }
  }),

  prometheusUrl: computed('cluster.id', function() {
    if (get(this, 'pageScope') === 'cluster') {
      return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/cattle-prometheus/services/http:access-prometheus:80/proxy/`
    } else if (get(this, 'pageScope') === 'project') {
      if (get(this, 'grafana.istioUrl')) {
        return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/cattle-prometheus/services/http:access-prometheus:80/proxy/`
      } else {
        return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/cattle-prometheus-${ (get(this, 'project.id') || '').split(':').get('lastObject') }/services/http:access-prometheus:80/proxy/`
      }
    }
  }),
});
