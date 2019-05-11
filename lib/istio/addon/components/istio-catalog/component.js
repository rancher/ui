import Component from '@ember/component';
import layout from './template';
import { get, computed, setProperties, set } from '@ember/object';
import { inject as service } from '@ember/service';
import CrudCatalog from 'shared/mixins/crud-catalog';
import { requiredError } from 'shared/utils/util';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit'
import ReservationCheck from 'istio/mixins/istio-reservation-check';

const APP_VERSION = 'catalog://?catalog=system-library&template=rancher-istio&version=1.1.5';
const GATEWAY_TYPE = ['NodePort', 'LoadBalancer'];
const PERSISTENCE_KEYS = ['existingClaim', 'size', 'storageClass']

const GATEWAY_ENABLED = 'gateways.enabled'
const HTTP2_PORT = 'gateways.istio-ingressgateway.ports[0].nodePort'
const HTTPS_PORT = 'gateways.istio-ingressgateway.ports[1].nodePort'
const LB_IP = 'gateways.istio-ingressgateway.loadBalancerIP'
const LB_SOURCE_RANGES = 'gateways.istio-ingressgateway.loadBalancerSourceRanges'
const GRAFANA_PERISTENCE_ENABLED = 'grafana.persistence.enabled'

const PILOT_REQUEST_CPU = 'pilot.resources.requests.cpu'
const PILOT_REQUEST_MEM = 'pilot.resources.requests.memory'
const PILOT_LIMIT_CPU = 'pilot.resources.limits.cpu'
const PILOT_LIMIT_MEM = 'pilot.resources.limits.memory'

const PROMETHEUS_RETENTION = 'prometheus.retention'
const PROMETHEUS_REQUEST_MEM = 'prometheus.resources.requests.memory'
const PROMETHEUS_REQUEST_CPU = 'prometheus.resources.requests.cpu'
const PROMETHEUS_LIMIT_MEM = 'prometheus.resources.limits.memory'
const PROMETHEUS_LIMIT_CPU = 'prometheus.resources.limits.cpu'
const PROMETHEUS_NODE_SELECTOR_PREFIX = 'prometheus.nodeSelector."'

const MIXER_REQUEST_CPU = 'mixer.telemetry.resources.requests.cpu'
const MIXER_REQUEST_MEM = 'mixer.telemetry.resources.requests.memory'
const MIXER_LIMIT_CPU = 'mixer.telemetry.resources.limits.cpu'
const MIXER_LIMIT_MEM = 'mixer.telemetry.resources.limits.memory'
const MIXER_NODE_SELECTOR_PREFIX = 'mixer.nodeSelector."'


const ANSWER_TO_CONFIG = {
  'tracing.enabled':                    'tracingEnabled',
  'prometheus.enabled':                 'prometheusEnabled',
  'grafana.enabled':                    'grafanaEnabled',
  [PILOT_REQUEST_CPU]:                  'pilotRequestCpu',
  [PILOT_REQUEST_MEM]:                  'pilotRequestMemory',
  [PILOT_LIMIT_MEM]:                    'pilotLimitMemory',
  [PILOT_LIMIT_CPU]:                    'pilotLimitCPU',
  [GATEWAY_ENABLED]:                    'gatewayEnabled',
  [HTTP2_PORT]:                         'http2Port',
  [HTTPS_PORT]:                         'httpsPort',
  'galley.enabled':                     'galleyEnabled',
  'certmanager.enabled':                'certmanagerEnabled',
  'gateways.istio-ingressgateway.type': 'gatewayType',
  [LB_IP]:                              'loadBalancerIP',
  [GRAFANA_PERISTENCE_ENABLED]:         'grafanaPersistenceEnabled',
  [PROMETHEUS_RETENTION]:               'prometheusRetention',
  [PROMETHEUS_REQUEST_MEM]:             'prometheusRequestMemory',
  [PROMETHEUS_LIMIT_MEM]:               'prometheusLimitMemory',
  [PROMETHEUS_REQUEST_CPU]:             'prometheusRequestCPU',
  [PROMETHEUS_LIMIT_CPU]:               'prometheusLimitCPU',
  [MIXER_REQUEST_MEM]:                  'mixerRequestMemory',
  [MIXER_LIMIT_MEM]:                    'mixerLimitMemory',
  [MIXER_REQUEST_CPU]:                  'mixerRequestCPU',
  [MIXER_LIMIT_CPU]:                    'mixerLimitCPU',
  'pilot.traceSampling':                'traceSampling',
  'mixer.policy.enabled':               'mixerPolicyEnabled',
}

const HIDDEN_KEYS = {
  'enableCRDs':                                  true,
  'mixer.enabled':                               true,
  'pilot.enabled':                               true,
  'security.enabled':                            true,
  'nodeagent.enabled':                           false,
  'istio_cni.enabled':                           false,
  'istiocoredns.enabled':                        false,
  'sidecarInjectorWebhook.enabled':              true,
  'mtls.enabled':                                true,
  'gateways.istio-ingressgateway.ports[0].name': 'http2',
  'gateways.istio-ingressgateway.ports[0].port': 80,
  'gateways.istio-ingressgateway.ports[1].name': 'https',
  'gateways.istio-ingressgateway.ports[1].port': 443,
  'kiali.enabled':                               true,
}

export default Component.extend(CrudCatalog, ReservationCheck, {
  scope: service(),
  intl:  service(),

  layout,

  answers:    null,
  appName:    'cluster-istio',
  nsName:     'istio-system',
  appVersion: APP_VERSION,

  init() {
    this._super(...arguments);

    let customAnswers = {};

    const config = {
      tracingEnabled:            true,
      kialiEnabled:              true,
      prometheusEnabled:         true,
      grafanaEnabled:            true,
      grafanaPersistenceEnabled: false,
      grafanaPersistenceSize:    '5Gi',
      certmanagerEnabled:        false,
      galleyEnabled:             true,
      autoInject:                true,
      mtlsEnabled:               false,
      pilotRequestCpu:           500,
      pilotRequestMemory:        2048,
      gatewayType:               'NodePort',
      gatewayEnabled:            false,
      http2Port:                 31380,
      httpsPort:                 31390,
      prometheusRetention:       6,
      prometheusLimitMemory:     1000,
      prometheusRequestMemory:   750,
      prometheusRequestCPU:      750,
      prometheusLimitCPU:        1000,
      mixerRequestCPU:           1000,
      mixerLimitCPU:             4800,
      mixerRequestMemory:        1024,
      mixerLimitMemory:          4048,
      traceSampling:             1,
      mixerPolicyEnabled:        true,
      pilotLimitCPU:             1000,
      pilotLimitMemory:          4096,
    }

    set(this, 'config', config)

    setProperties(this, {
      config,
      grafana:                   { persistence: { size: '5Gi', } },
      useGrafanaStorageClass:    true,
    })

    if ( get(this, 'enabled') ) {
      const answers = get(this, 'app.answers') || {};
      const answerKeys = Object.keys(ANSWER_TO_CONFIG) || []
      const grafanaPersistenceKeys = PERSISTENCE_KEYS.map((key) => `grafana.persistence.${ key }`)

      const nodeSelector = {};
      const mixerNodeSelector = {};
      const loadBalancerSourceRanges = [];

      Object.keys(answers).filter((key) => key.startsWith(PROMETHEUS_NODE_SELECTOR_PREFIX) ).map((k) => {
        let value = answers[k] || '';
        const key = k.replace('prometheus.nodeSelector.', '').slice(1, -1).replace(/\\\./g, '.')

        nodeSelector[key] = value
      })

      Object.keys(answers).filter((key) => key.startsWith(MIXER_NODE_SELECTOR_PREFIX) ).map((k) => {
        let value = answers[k] || '';
        const key = k.replace('mixer.nodeSelector.', '').slice(1, -1).replace(/\\\./g, '.')

        mixerNodeSelector[key] = value
      });

      Object.keys(answers).filter((key) => key.startsWith(`${ LB_SOURCE_RANGES }[`) ).map((k) => {
        loadBalancerSourceRanges.pushObject(answers[k])
      })

      setProperties(this, {
        nodeSelector,
        mixerNodeSelector,
        loadBalancerSourceRanges,
        prometheusPreRequestCPU:    answers[PROMETHEUS_REQUEST_CPU],
        prometheusPreRequestMemory: answers[PROMETHEUS_REQUEST_MEM],
        mixerPreRequestCPU:         answers[MIXER_REQUEST_CPU],
        mixerRequestMemory:         answers[MIXER_REQUEST_MEM],
      })

      Object.keys(answers).forEach((key = '') => {
        if (key.startsWith(PROMETHEUS_NODE_SELECTOR_PREFIX) || key.startsWith(MIXER_NODE_SELECTOR_PREFIX) || key.startsWith(`${ LB_SOURCE_RANGES }[`)) {
          return
        }

        if (Object.keys(HIDDEN_KEYS).includes(key)) {
          return
        }

        if (grafanaPersistenceKeys.includes(key)) {
          return set(this, key, answers[key])
        }

        if (answerKeys.includes(key)) {
          let value

          switch (key) {
          case PILOT_REQUEST_CPU:
          case PROMETHEUS_LIMIT_CPU:
          case PROMETHEUS_REQUEST_CPU:
          case MIXER_REQUEST_CPU:
          case MIXER_LIMIT_CPU:
          case PILOT_LIMIT_CPU:
            value = convertToMillis(answers[key])
            break;
          case PILOT_REQUEST_MEM:
          case PILOT_LIMIT_MEM:
          case PROMETHEUS_REQUEST_MEM:
          case PROMETHEUS_LIMIT_MEM:
          case MIXER_REQUEST_MEM:
          case MIXER_LIMIT_MEM:
            value = parseSi(answers[key], 1024) / 1048576
            break;
          case PROMETHEUS_RETENTION:
            value = parseInt(answers[key])
            break;
          default:
            value = answers[key]
          }

          return set(this, `config.${ ANSWER_TO_CONFIG[key] }`, value)
        }

        customAnswers[key] = answers[key];
      });
    }

    setProperties(this, { customAnswers, })
  },

  actions: {
    save(cb) {
      set(this, 'errors', [])
      const errors = this.validate() || []

      if (errors.length > 0) {
        set(this, 'errors', errors)
        cb()

        return
      }

      let answers = { ...HIDDEN_KEYS };

      const answerKeys = Object.keys(ANSWER_TO_CONFIG) || []

      answerKeys.map((key) => {
        const value = get(this, `config.${ ANSWER_TO_CONFIG[key] }`)

        switch (key) {
        case PILOT_REQUEST_CPU:
        case PILOT_LIMIT_CPU:
        case PROMETHEUS_LIMIT_CPU:
        case PROMETHEUS_REQUEST_CPU:
        case MIXER_REQUEST_CPU:
        case MIXER_LIMIT_CPU:
          answers[key] = `${ value }m`
          break;
        case PILOT_REQUEST_MEM:
        case PILOT_LIMIT_MEM:
        case PROMETHEUS_REQUEST_MEM:
        case PROMETHEUS_LIMIT_MEM:
        case MIXER_REQUEST_MEM:
        case MIXER_LIMIT_MEM:
          answers[key] = `${ value }Mi`
          break;
        case PROMETHEUS_RETENTION:
          answers[key] = `${ value }h`
          break;
        default:
          answers[key] = value
        }
      })

      if (get(this, 'config.grafanaEnabled') && get(this, 'config.grafanaPersistenceEnabled')) {
        this.willSavePersistence(answers, 'grafana')
      }

      ['prometheus', 'mixer'].map((component) => {
        (get(this, `${ component }NodeSelectors`) || []).map((selector) => {
          let { key, value } = selector

          if (key.includes('.')) {
            key = key.replace(/\./g, '\\.')
          }
          answers[`${ component }.nodeSelector."${ key }"`] = value
        });
      })

      if (get(this, 'config.gatewayEnabled') && get(this, 'config.gatewayType') === 'LoadBalancer') {
        (get(this, 'loadBalancerSourceRanges') || []).map((value, idx) => {
          answers[`${ LB_SOURCE_RANGES }[${ idx }]`] = value
        });
      }

      this.save(cb, answers);
    }
  },

  gatewayTypeContent: computed(() => {
    return GATEWAY_TYPE.map((value) => ({
      label: value,
      value
    }))
  }),

  kialiUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:kiali-http:80/proxy/`
  }),

  jaegerUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:tracing:80/proxy/jaeger/search`
  }),

  grafanaUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:grafana:80/proxy/`
  }),

  prometheusUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:prometheus-http:80/proxy/`
  }),

  prometheusSchedulableNodes: computed('prometheusNodeSelectors.[]', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];
    const out = allNodes.filterBy('isUnschedulable', false)
      .filter((node) => (get(this, 'prometheusNodeSelectors') || [])
        .every((selector) => {
          const labelValue = (get(node, 'labels') || {})[get(selector, 'key')];

          if ( get(selector, 'value') === '' ) {
            return labelValue !== undefined;
          } else {
            return get(selector, 'value') === labelValue;
          }
        }));

    return out;
  }),

  insufficientPrometheusCPU: computed('prometheusSchedulableNodes.@each.{allocatable,requested}', 'config.prometheusRequestCPU', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    let maxLeftCpu = 0;

    get(this, 'prometheusSchedulableNodes').forEach((node) => {
      const left =  convertToMillis(get(node, 'allocatable.cpu')) - convertToMillis(get(node, 'requested.cpu'));

      if ( left > maxLeftCpu) {
        maxLeftCpu = left;
      }
    });

    return !get(this, 'enabled') && maxLeftCpu <= get(this, 'config.prometheusRequestCPU');
  }),

  insufficientPrometheusMemory: computed('prometheusSchedulableNodes.@each.{allocatable,requested}', 'config.prometheusRequestMemory', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    let maxLeftMemory = 0;

    get(this, 'prometheusSchedulableNodes').forEach((node) => {
      const left =  (parseSi(get(node, 'allocatable.memory'), 1024) / 1048576) - (parseSi(get(node, 'requested.memory'), 1024) / 1048576);

      if ( left > maxLeftMemory) {
        maxLeftMemory = left;
      }
    });

    return !get(this, 'enabled') && maxLeftMemory <= get(this, 'config.prometheusRequestMemory');
  }),

  mixerSchedulableNodes: computed('mixerNodeSelectors.[]', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];
    const out = allNodes.filterBy('isUnschedulable', false)
      .filter((node) => (get(this, 'mixerNodeSelectors') || [])
        .every((selector) => {
          const labelValue = (get(node, 'labels') || {})[get(selector, 'key')];

          if ( get(selector, 'value') === '' ) {
            return labelValue !== undefined;
          } else {
            return get(selector, 'value') === labelValue;
          }
        }));

    return out;
  }),

  insufficientMixerCPU: computed('mixerSchedulableNodes.@each.{allocatable,requested}', 'config.mixerRequestCPU', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    let maxLeftCpu = 0;

    get(this, 'mixerSchedulableNodes').forEach((node) => {
      const left =  convertToMillis(get(node, 'allocatable.cpu')) - convertToMillis(get(node, 'requested.cpu'));

      if ( left > maxLeftCpu) {
        maxLeftCpu = left;
      }
    });

    return !get(this, 'enabled') && maxLeftCpu <= get(this, 'config.mixerRequestCPU');
  }),

  insufficientMixerMemory: computed('mixerSchedulableNodes.@each.{allocatable,requested}', 'config.mixerRequestMemory', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    let maxLeftMemory = 0;

    get(this, 'prometheusSchedulableNodes').forEach((node) => {
      const left =  (parseSi(get(node, 'allocatable.memory'), 1024) / 1048576) - (parseSi(get(node, 'requested.memory'), 1024) / 1048576);

      if ( left > maxLeftMemory) {
        maxLeftMemory = left;
      }
    });

    return !get(this, 'enabled') && maxLeftMemory <= get(this, 'config.mixerRequestMemory');
  }),

  saveDisabled: computed('insufficientMixerCPU', 'insufficientMixerMemory', 'insufficientPrometheusMemory', 'insufficientPrometheusCPU', 'enabled', function() {
    return get(this, 'insufficient') || get(this, 'insufficientPrometheusCPU') || get(this, 'insufficientPrometheusMemory')
           || get(this, 'insufficientMixerCPU') || get(this, 'insufficientMixerMemory');
  }),

  prometheusWarning: computed('insufficientPrometheusMemory', 'insufficientPrometheusCPU', 'prometheusNodeSelectors.[]', function() {
    const {
      insufficientPrometheusMemory, insufficientPrometheusCPU, prometheusNodeSelectors = [], intl
    } = this

    if (prometheusNodeSelectors.length === 0) {
      return
    }

    const cpu = get(this, 'config.prometheusRequestCPU')
    const memory = get(this, 'config.prometheusRequestMemory')
    const prefix = 'clusterIstioPage.insufficientSize.selectors.'
    const component = 'Prometheus'

    if (insufficientPrometheusCPU && insufficientPrometheusMemory) {
      return intl.t(`${ prefix }all`, {
        cpu,
        memory,
        component
      })
    }
    if (insufficientPrometheusCPU) {
      return intl.t(`${ prefix }cpu`, {
        cpu,
        component
      })
    }
    if (insufficientPrometheusMemory) {
      return intl.t(`${ prefix }memory`, {
        memory,
        component
      })
    }
  }),

  mixerWarning: computed('insufficientMixerCPU', 'insufficientMixerMemory', 'mixerNodeSelectors.[]', function() {
    const {
      insufficientMixerCPU, insufficientMixerMemory, mixerNodeSelectors = [], intl
    } = this

    if (mixerNodeSelectors.length === 0) {
      return
    }

    const cpu = get(this, 'config.mixerRequestCPU')
    const memory = get(this, 'config.mixerRequestMemory')
    const prefix = 'clusterIstioPage.insufficientSize.selectors.'
    const component = 'Mixer'

    if (insufficientMixerCPU && insufficientMixerMemory) {
      return intl.t(`${ prefix }all`, {
        cpu,
        memory,
        component
      })
    }
    if (insufficientMixerCPU) {
      return intl.t(`${ prefix }cpu`, {
        cpu,
        component
      })
    }
    if (insufficientMixerMemory) {
      return intl.t(`${ prefix }memory`, {
        memory,
        component
      })
    }
  }),

  mixerInsufficientCPU: computed('mixerPreRequestCPU', 'config.mixerRequestCPU', 'scope.currentCluster.nodes.@each.{allocatable,requested}', () => {
  }),

  nsNeedMove: computed('namespace.projectId', 'project.id', function() {
    const { namespace = {}, project = {} } = this

    return namespace.projectId !== project.id
  }),

  willSavePersistence(answers, component) {
    PERSISTENCE_KEYS.map((k) => {
      const key = `${ component }.persistence.${ k }`
      const useStorageClass = get(this, `use${ component.charAt(0).toUpperCase() + component.substr(1) }StorageClass`)

      if (['storageClass', 'size'].includes(k) && useStorageClass) {
        answers[key] = get(this, key)
      }
      if (k === 'existingClaim' && !useStorageClass) {
        answers[key] = get(this, key)
      }
    })
  },

  validate() {
    const errors = []

    if (get(this, 'config.grafanaEnabled') && get(this, 'config.grafanaPersistenceEnabled')) {
      errors.pushObjects(this.validatePV('grafana'))
    }

    return errors
  },

  validatePV(component) {
    const { intl, storageClasses = [] } = this
    const errors = []

    const defaultStorageClasses = storageClasses.filter((s) => s.annotations && (s.annotations['storageclass.kubernetes.io/is-default-class'] === 'true' || s.annotations['storageclass.beta.kubernetes.io/is-default-class'] === 'true'))

    if (get(this, `use${ component.charAt(0).toUpperCase() + component.substr(1) }StorageClass`)) {
      if (defaultStorageClasses.length === 0 && !get(this, `${ component }.persistence.storageClass`)) {
        const emptyError = intl.t('globalRegistryPage.config.storageClass.emptyError')

        errors.pushObject(emptyError)
      }
    } else if (!get(this, `${ component }.persistence.existingClaim`)){
      errors.pushObject(requiredError(`globalRegistryPage.config.${ component }.existingClaim.label`))
    }

    return errors
  },
});
