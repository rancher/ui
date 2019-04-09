import Component from '@ember/component';
import layout from './template';
import { get, computed, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import CrudCatalog from 'shared/mixins/crud-catalog';

const APP_VERSION = 'catalog://?catalog=istio&template=istio&version=1.1.0';
const INGRESS_TYPE = ['ClusterIP', 'NodePort'];

export default Component.extend(CrudCatalog, {
  scope: service(),
  layout,

  answers:    null,
  appName:    'cluster-istio',
  nsName:     'istio-system',
  appVersion: APP_VERSION,

  init() {
    this._super(...arguments);

    let customAnswers = {};

    if ( get(this, 'enabled') ) {
      const answers = get(this, 'app.answers') || {};

      Object.keys(answers).forEach((key) => {
        switch (key) {
        default:
          customAnswers[key] = answers[key];
        }
      });
    } else {
      customAnswers = {
        'global.rancher.domain':              window.location.host,
        'global.rancher.clusterId':           get(this, 'scope.currentCluster.id'),
        'gateways.istio-ingressgateway.type': 'NodePort',
        'tracing.enabled':                    true,
        'kiali.enabled':                      true,
        'prometheus.enabled':                 true,
        'grafana.enabled':                    false,
        'certmanager.enabled':                false
      }
    }

    const config = {
      tracingEnabled:            true,
      kialiEnabled:              true,
      prometheusEnabled:         true,
      grafanaEnabled:            true,
      grafanaPersistenceEnabled: true,
      grafanaPersistenceSize:    '5Gi',
      certmanagerEnabled:        false,
      galleyEnabled:             true,
      autoInject:                true,
      mtlsEnabled:               false,
    }

    setProperties(this, {
      customAnswers,
      config,
    })
  },

  actions: {
    save(cb) {
      const answers = {};

      this.save(cb, answers);
    }
  },

  ingressTypeContent: computed(() => {
    return INGRESS_TYPE.map((value) => ({
      label: value,
      value
    }))
  }),

  kialiUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:kiali:20001/proxy/`
  }),

  jaegerUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:tracing:80/proxy/`
  }),

  grafanaUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:grafana:80/proxy/`
  }),

  prometheusUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:prometheus:80/proxy/`
  }),
});
