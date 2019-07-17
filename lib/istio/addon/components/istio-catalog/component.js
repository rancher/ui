import Component from '@ember/component';
import layout from './template';
import {
  get, computed, setProperties, set, defineProperty, observer
} from '@ember/object';
import { inject as service } from '@ember/service';
import CrudCatalog from 'shared/mixins/crud-catalog';
import { requiredError } from 'shared/utils/util';
import { convertToMillis, ucFirst } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit'
import ReservationCheck from 'shared/mixins/reservation-check';
import { alias } from '@ember/object/computed'
import CatalogUpgrade from 'shared/mixins/catalog-upgrade';
import { all as PromiseAll } from 'rsvp';
import Semver from 'semver';

const GATEWAY_TYPE = ['NodePort', 'LoadBalancer'];
const PERSISTENCE_KEYS = ['existingClaim', 'size', 'storageClass']

const DEFAULT_HTTP2_PORT = 31380;
const DEFAULT_HTTPS_PORT = 31390;
const GATEWAY_ENABLED = 'gateways.enabled'
const HTTP2_PORT = 'gateways.istio-ingressgateway.ports[0].nodePort'
const HTTPS_PORT = 'gateways.istio-ingressgateway.ports[1].nodePort'
const LB_IP = 'gateways.istio-ingressgateway.loadBalancerIP'
const LB_SOURCE_RANGES = 'gateways.istio-ingressgateway.loadBalancerSourceRanges'

const PILOT_REQUEST_CPU = 'pilot.resources.requests.cpu'
const PILOT_REQUEST_MEM = 'pilot.resources.requests.memory'
const PILOT_LIMIT_CPU = 'pilot.resources.limits.cpu'
const PILOT_LIMIT_MEM = 'pilot.resources.limits.memory'
const PILOT_NODE_SELECTOR_PREFIX = 'pilot.nodeSelector.'

const MIXER_REQUEST_CPU = 'mixer.telemetry.resources.requests.cpu'
const MIXER_REQUEST_MEM = 'mixer.telemetry.resources.requests.memory'
const MIXER_LIMIT_CPU = 'mixer.telemetry.resources.limits.cpu'
const MIXER_LIMIT_MEM = 'mixer.telemetry.resources.limits.memory'
const MIXER_NODE_SELECTOR_PREFIX = 'mixer.nodeSelector.'

const POLICY_REQUEST_CPU = 'mixer.policy.resources.requests.cpu'
const POLICY_REQUEST_MEM = 'mixer.policy.resources.requests.memory'
const POLICY_LIMIT_CPU =   'mixer.policy.resources.limits.cpu'
const POLICY_LIMIT_MEM =   'mixer.policy.resources.limits.memory'

const GATEWAY_REQUEST_CPU = 'gateways.istio-ingressgateway.resources.requests.cpu'
const GATEWAY_REQUEST_MEM = 'gateways.istio-ingressgateway.resources.requests.memory'
const GATEWAY_LIMIT_CPU =   'gateways.istio-ingressgateway.resources.limits.cpu'
const GATEWAY_LIMIT_MEM =   'gateways.istio-ingressgateway.resources.limits.memory'
const GATEWAY_NODE_SELECTOR_PREFIX = 'gateways.istio-ingressgateway.nodeSelector.'

const TRACING_REQUEST_CPU = 'tracing.jaeger.resources.requests.cpu'
const TRACING_REQUEST_MEM = 'tracing.jaeger.resources.requests.memory'
const TRACING_LIMIT_CPU =   'tracing.jaeger.resources.limits.cpu'
const TRACING_LIMIT_MEM =   'tracing.jaeger.resources.limits.memory'
const TRACING_NODE_SELECTOR_PREFIX = 'tracing.nodeSelector.'

const MEMBERS = 'global.members'
const MEMBER_USER = 'User'
const MEMBER_GROUP = 'Group'
const MEMBER_SYSYTEM = 'system:authenticated'

const ANSWER_TO_CONFIG = {
  'tracing.enabled':                    'tracingEnabled',
  [PILOT_REQUEST_CPU]:                  'pilotRequestCpu',
  [PILOT_REQUEST_MEM]:                  'pilotRequestMemory',
  [PILOT_LIMIT_MEM]:                    'pilotLimitMemory',
  [PILOT_LIMIT_CPU]:                    'pilotLimitCpu',
  [GATEWAY_ENABLED]:                    'gatewayEnabled',
  'gateways.istio-ingressgateway.type': 'gatewayType',
  [LB_IP]:                              'loadBalancerIP',
  [MIXER_REQUEST_MEM]:                  'mixerTelemetryRequestMemory',
  [MIXER_LIMIT_MEM]:                    'mixerTelemetryLimitMemory',
  [MIXER_REQUEST_CPU]:                  'mixerTelemetryRequestCpu',
  [MIXER_LIMIT_CPU]:                    'mixerTelemetryLimitCpu',
  'pilot.traceSampling':                'traceSampling',
  'mixer.policy.enabled':               'mixerPolicyEnabled',
  'mtls.enabled':                       'mtlsEnabled',
  [TRACING_REQUEST_CPU]:                'tracingRequestCpu',
  [TRACING_REQUEST_MEM]:                'tracingRequestMemory',
  [TRACING_LIMIT_CPU]:                  'tracingLimitCpu',
  [TRACING_LIMIT_MEM]:                  'tracingLimitMemory',
  [GATEWAY_REQUEST_CPU]:                'gatewayRequestCpu',
  [GATEWAY_REQUEST_MEM]:                'gatewayRequestMemory',
  [GATEWAY_LIMIT_CPU]:                  'gatewayLimitCpu',
  [GATEWAY_LIMIT_MEM]:                  'gatewayLimitMemory',
  [POLICY_REQUEST_MEM]:                 'mixerPolicyRequestMemory',
  [POLICY_LIMIT_MEM]:                   'mixerPolicyLimitMemory',
  [POLICY_REQUEST_CPU]:                 'mixerPolicyRequestCpu',
  [POLICY_LIMIT_CPU]:                   'mixerPolicyLimitCpu',
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
  'kiali.enabled':                               true,
  'galley.enabled':                              true,
  'certmanager.enabled':                         false,
  'global.rancher.domain':                       '',
  'global.rancher.clusterId':                    '',
  'global.monitoring.type':                      'cluster-monitoring',
}

const NODE_PORT_KEYS = {
  'gateways.istio-ingressgateway.ports[0].name': 'http2',
  'gateways.istio-ingressgateway.ports[0].port': 80,
  'gateways.istio-ingressgateway.ports[1].name': 'https',
  'gateways.istio-ingressgateway.ports[1].port': 443,
}

const WORKLOADS = ['mixerTelemetry', 'tracing', 'gateway', 'pilot', 'mixerPolicy']
const ISTIO_TEMPLATE = 'system-library-rancher-istio';

export default Component.extend(CrudCatalog, ReservationCheck, CatalogUpgrade, {
  scope:   service(),
  intl:    service(),
  grafana: service(),

  layout,

  answers:      null,
  appName:      'cluster-istio',
  nsName:       'istio-system',
  templateId:   ISTIO_TEMPLATE,
  templateName: 'rancher-istio',

  clusterLevelMinCpu:    500,
  clusterLevelMinMemory: 500,

  level:                   alias('scope.currentPageScope'),
  cluster:                 alias('scope.currentCluster'),
  enableClusterMonitoring: alias('scope.currentCluster.enableClusterMonitoring'),

  init() {
    this._super(...arguments);

    this.initConfig();
    this.initWorkloads();

    if ( get(this, 'enabled') ) {
      this.initAnswers();
    }
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

      let answers = {
        ...HIDDEN_KEYS,
        'global.rancher.domain':    window.location.host,
        'global.rancher.clusterId': get(this, 'cluster.id'),
      };

      const answerKeys = Object.keys(ANSWER_TO_CONFIG) || []

      answerKeys.map((key) => {
        const value = get(this, `config.${ ANSWER_TO_CONFIG[key] }`)

        if ( value === undefined || value === '' ) {
          return;
        }

        switch (key) {
        case PILOT_REQUEST_CPU:
        case PILOT_LIMIT_CPU:
        case MIXER_REQUEST_CPU:
        case MIXER_LIMIT_CPU:
        case TRACING_REQUEST_CPU:
        case TRACING_LIMIT_CPU:
        case GATEWAY_REQUEST_CPU:
        case GATEWAY_LIMIT_CPU:
        case POLICY_REQUEST_CPU:
        case POLICY_LIMIT_CPU:
          answers[key] = `${ value }m`
          break;
        case PILOT_REQUEST_MEM:
        case PILOT_LIMIT_MEM:
        case MIXER_REQUEST_MEM:
        case MIXER_LIMIT_MEM:
        case TRACING_REQUEST_MEM:
        case TRACING_LIMIT_MEM:
        case GATEWAY_REQUEST_MEM:
        case GATEWAY_LIMIT_MEM:
        case POLICY_REQUEST_MEM:
        case POLICY_LIMIT_MEM:
          answers[key] = `${ value }Mi`
          break;
        default:
          answers[key] = value
        }
      });

      ['tracing', 'gateway', 'pilot', 'mixer'].map((component) => {
        (get(this, `${ component }NodeSelectors`) || []).map((selector) => {
          let { key, value } = selector

          if (key.includes('.')) {
            key = key.replace(/\./g, '\\.')
          }

          if (component === 'gateway') {
            answers[`gateways.istio-ingressgateway.nodeSelector.${ key }`] = value
          } else {
            answers[`${ component }.nodeSelector.${ key }`] = value
          }
        });
      })

      if (get(this, 'config.gatewayEnabled') && get(this, 'config.gatewayType') === 'LoadBalancer') {
        (get(this, 'loadBalancerSourceRanges') || []).map((value, idx) => {
          answers[`${ LB_SOURCE_RANGES }[${ idx }]`] = value
        });
      }

      if (get(this, 'config.gatewayEnabled') && get(this, 'config.gatewayType') === 'NodePort') {
        (Object.keys(NODE_PORT_KEYS) || []).map((key) => {
          answers[key] = NODE_PORT_KEYS[key]
        })
        answers[HTTP2_PORT] = get(this, 'config.http2Port')
        answers[HTTPS_PORT] = get(this, 'config.httpsPort')
      }

      const users = get(this, 'globalStore').all('user');

      if (get(this, 'allowSystemGroup')) {
        answers[`${ MEMBERS }[0].kind`] = MEMBER_GROUP
        answers[`${ MEMBERS }[0].name`] = MEMBER_SYSYTEM
      } else {
        (get(this, 'members') || []).map((m = {}, idx) => {
          const { principalType, id } = m
          let name = id

          if (principalType === 'user') {
            const filtered = users.filter((u = {}) => u.principalIds.includes(id)).get('firstObject')

            if (filtered) {
              name = get(filtered, 'id')
            } else {
              return
            }
          }

          answers[`${ MEMBERS }[${ idx }].kind`] = ucFirst(principalType)
          answers[`${ MEMBERS }[${ idx }].name`] = name
        })
      }

      this.save(cb, answers);
    },

    addAuthorizedPrincipal(principal) {
      if (principal) {
        let { members = [], globalStore } = this

        members.pushObject(globalStore.createRecord(principal));
        set(this, 'members', members);
      }
    },

    removeMember(member) {
      let { members = [] } = this;

      members.removeObject(member);
    },
  },

  workloadEnabledChange: observer('config.tracingEnabled', 'config.gatewayEnabled', 'config.mixerPolicyEnabled', function() {
    ['tracing', 'gateway'].map((w) => {
      if (!get(this, `config.${ w }Enabled`)) {
        set(this, `${ w }NodeSelectors`, [])
      }
    })

    this.notifyPropertyChange('requestsCpu')
    this.notifyPropertyChange('requestsMemory')
    this.notifyPropertyChange('saveDisabled')
  }),

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

  prometheusUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/cattle-prometheus/services/http:access-prometheus:80/proxy/`
  }),

  saveDisabled: computed('mixerTelemetryWarning', 'enabled', 'istioWarning', 'pilotWarning', 'tracingWarning', 'gatewayWarning', 'mixerPolicyWarning', 'mixerWarning', function() {
    return [...WORKLOADS, 'mixer'].reduce((out, w) => {
      if (['gateway', 'tracing', 'mixerPolicy'].includes(w) && !get(this, `config.${ w }Enabled`)) {
        return out || (get(this, `${ w }Warning`) || false)
      } else if (w === 'mixerTelemetry') {
        return out || (get(this, 'mixerTelemetryWarning') || false) || (get(this, 'mixerWarning') )
      } else {
        return out || (get(this, `${ w }Warning`) || false)
      }
    }, false) || (get(this, 'istioWarning') || false)
  }),

  canReuse: computed('monitoringApp.externalIdInfo.version', function() {
    const version = get(this, 'monitoringApp.externalIdInfo.version')
    const cannotReuseVersion = '0.0.3'

    return Semver.gt(Semver.coerce(version), Semver.coerce(cannotReuseVersion))
  }),

  canEnable: computed('enableClusterMonitoring', 'canReuse', function() {
    return get(this, 'enableClusterMonitoring') && get(this, 'canReuse')
  }),

  istioWarning: computed('insufficientCpu', 'insufficientMemory', function() {
    let {
      insufficientCpu, insufficientMemory, intl, minCpu, minMemory, enabled
    } = this
    const prefix = 'clusterIstioPage.insufficientSize.total'
    const action = enabled ? 'update' : 'enable'

    if (insufficientCpu && insufficientMemory) {
      return intl.t(`${ prefix }.all`, {
        minCpu,
        minMemory,
        action,
      })
    } else if (insufficientCpu) {
      return intl.t(`${ prefix }.cpu`, {
        minCpu,
        action,
      })
    } else if (insufficientMemory) {
      return intl.t(`${ prefix }.memory`, {
        minMemory,
        action,
      })
    }
  }),

  enabled: computed('app.state', function() {
    return !!get(this, 'app') && get(this, 'app.state') !== 'removing'
  }),

  nsNeedMove: computed('namespace.projectId', 'project.id', function() {
    const { namespace = {}, project = {} } = this

    return namespace.projectId !== project.id
  }),

  requestsCpu: computed('config.mixerTelemetryRequestCpu', 'config.pilotRequestCpu', 'config.gatewayRequestCpu', 'config.tracingRequestCpu', 'config.mixerPolicyRequestCpu', function() {
    return WORKLOADS
      .filter((w) => {
        if (['gateway', 'tracing', 'mixerPolicy'].includes(w) && !get(this, `config.${ w }Enabled`)) {
          return false
        }

        return true
      })
      .reduce((all, w) => {
        return all + parseInt(get(this, `config.${ w }RequestCpu`) || 0)
      }, 0)
  }),

  requestsMemory: computed('config.mixerTelemetryRequestMemory', 'config.pilotRequestMemory', 'config.gatewayRequestMemory', 'config.tracingRequestMemory', 'config.mixerPolicyRequestMemory', function() {
    return WORKLOADS
      .filter((w) => {
        if (['gateway', 'tracing', 'mixerPolicy'].includes(w) && !get(this, `config.${ w }Enabled`)) {
          return false
        }

        return true
      })
      .reduce((all, w) => {
        return all + parseInt(get(this, `config.${ w }RequestMemory`) || 0)
      }, 0)
  }),

  mixerSchedulableNodes: computed('mixerNodeSelectors.[]', 'cluster.nodes.@each.{allocatable,requested}', 'config.mixerPolicyEnabled', function() {
    return this.getSchedulableNodes('mixer')
  }),

  insufficientMixerCpu: computed('mixerSchedulableNodes.@each.{allocatable,requested}', 'config.mixerPolicyEnabled', 'config.mixerTelemetryRequestCpu', 'config.mixerPolicyRequestCpu', 'cluster.nodes.@each.{allocatable,requested}', function() {
    let reservation

    if (get(this, 'config.mixerPolicyEnabled')) {
      reservation = Math.max(parseInt(get(this, 'config.mixerTelemetryRequestCpu') || '0'), parseInt(get(this, 'config.mixerPolicyRequestCpu') || '0'))
    } else {
      reservation = parseInt(get(this, 'config.mixerTelemetryRequestCpu') || '0')
    }


    return this.getComponentInsufficient('mixer', 'cpu', reservation)
  }),

  insufficientMixerMemory: computed('mixerSchedulableNodes.@each.{allocatable,requested}', 'config.mixerPolicyEnabled', 'config.mixerTelemetryRequestMemory', 'config.mixerPolicyRequestMemory', 'cluster.nodes.@each.{allocatable,requested}', function() {
    let reservation

    if (get(this, 'config.mixerPolicyEnabled')) {
      reservation = Math.max(parseInt(get(this, 'config.mixerTelemetryRequestMemory') || '0'), parseInt(get(this, 'config.mixerPolicyRequestMemory') || '0'))
    } else {
      reservation = parseInt(get(this, 'config.mixerTelemetryRequestMemory') || '0')
    }

    return this.getComponentInsufficient('mixer', 'memory', reservation)
  }),

  mixerWarning: computed('insufficientMixerCpu', 'insufficientMixerMemory', 'insufficientMixerTelemetryMemory', 'insufficientMixerTelemetryCpu', 'mixerNodeSelectors.[]', 'config.mixerPolicyEnabled', function() {
    if ((get(this, 'mixerNodeSelectors') || []).length === 0 ) {
      return
    }

    const displayName = get(this, 'config.mixerPolicyEnabled') ? get(this, 'intl').t('clusterIstioPage.telemetryAndPolicy') : undefined
    let componentCpu
    let componentMemory

    if (get(this, 'config.mixerPolicyEnabled')) {
      componentCpu = Math.max(parseInt(get(this, 'config.mixerTelemetryRequestCpu') || '0'), parseInt(get(this, 'config.mixerPolicyRequestCpu') || '0'))
      componentMemory = Math.max(parseInt(get(this, 'config.mixerTelemetryRequestMemory') || '0'), parseInt(get(this, 'config.mixerPolicyRequestMemory') || '0'))
    } else {
      componentCpu = parseInt(get(this, 'config.mixerTelemetryRequestCpu') || '0')
      componentMemory = parseInt(get(this, 'config.mixerTelemetryRequestMemory') || '0')
    }

    return this.getComponentWarning('mixer', componentCpu, componentMemory, displayName)
  }),

  istioVersions: computed('availableVersions', 'templateLables', function() {
    const { availableVersions = [], templateLables = {} } = this

    return availableVersions.map((v) => {
      const key = `rancher.istio.v${ v.value }`

      return {
        label: `${ v.label } (Istio ${ templateLables[key] })`,
        value: v.value,
      }
    })
  }),

  willSavePersistence(answers, component) {
    PERSISTENCE_KEYS.map((k) => {
      const key = `${ component }.persistence.${ k }`
      const useStorageClass = get(this, `use${ ucFirst(component) }StorageClass`)

      if (['storageClass', 'size'].includes(k) && useStorageClass) {
        answers[key] = get(this, key)
      }
      if (k === 'existingClaim' && !useStorageClass) {
        answers[key] = get(this, key)
      }
    })
  },

  validate() {
    const errors = [];

    ['pilot', 'mixerTelemetry'].map((w) => {
      errors.pushObjects(this.validateLimitAndRequest(w))
    })

    if (get(this, 'config.gatewayEnabled')) {
      errors.pushObjects(this.validateLimitAndRequest('gateway'))
    }

    if (get(this, 'config.tracingEnabled')) {
      errors.pushObjects(this.validateLimitAndRequest('tracing'))
    }

    if (get(this, 'config.mixerPolicyEnabled')) {
      errors.pushObjects(this.validateLimitAndRequest('mixerPolicy'))
    }

    ['traceSampling'].map((field) => {
      if (!get(this, `config.${ field }`)) {
        errors.pushObject(requiredError(`clusterIstioPage.config.${ field }.label`))
      }
    })

    if (get(this, 'config.gatewayEnabled') && get(this, 'config.gatewayType') === 'NodePort') {
      ['http2Port', 'httpsPort'].map((field) => {
        if (!get(this, `config.${ field }`)) {
          errors.pushObject(requiredError(`clusterIstioPage.config.${ field }.label`))
        }
      })
    }

    return errors
  },

  validatePV(component) {
    const { intl, storageClasses = [] } = this
    const errors = []

    const defaultStorageClasses = storageClasses.filter((s) => s.annotations && (s.annotations['storageclass.kubernetes.io/is-default-class'] === 'true' || s.annotations['storageclass.beta.kubernetes.io/is-default-class'] === 'true'))

    if (get(this, `use${ ucFirst(component) }StorageClass`)) {
      if (defaultStorageClasses.length === 0 && !get(this, `${ component }.persistence.storageClass`)) {
        const emptyError = intl.t('globalRegistryPage.config.storageClass.emptyError')

        errors.pushObject(emptyError)
      }

      if (!get(this, `${ component }.persistence.size`)) {
        errors.pushObject(intl.t('globalRegistryPage.config.storageClass.sizeRequired', { component: ucFirst(component) }))
      }
    } else if (!get(this, `${ component }.persistence.existingClaim`)){
      errors.pushObject(requiredError(`clusterIstioPage.existingClaim.label`, { component: ucFirst(component) }))
    }

    return errors
  },

  initConfig() {
    const config = {
      tracingEnabled:              true,
      kialiEnabled:                true,
      autoInject:                  true,
      mtlsEnabled:                 false,
      gatewayType:                 'NodePort',
      gatewayEnabled:              false,
      http2Port:                   DEFAULT_HTTP2_PORT,
      httpsPort:                   DEFAULT_HTTPS_PORT,
      mixerTelemetryRequestCpu:    1000,
      mixerTelemetryLimitCpu:      4800,
      mixerTelemetryRequestMemory: 1024,
      mixerTelemetryLimitMemory:   4096,
      traceSampling:               1,
      mixerPolicyEnabled:          true,
      pilotRequestCpu:             500,
      pilotRequestMemory:          2048,
      pilotLimitCpu:               1000,
      pilotLimitMemory:            4096,
      gatewayRequestCpu:           100,
      gatewayLimitCpu:             2000,
      gatewayRequestMemory:        128,
      gatewayLimitMemory:          1024,
      tracingRequestCpu:           100,
      tracingLimitCpu:             500,
      tracingRequestMemory:        100,
      tracingLimitMemory:          1024,
      mixerPolicyRequestCpu:       1000,
      mixerPolicyLimitCpu:         4800,
      mixerPolicyRequestMemory:    1024,
      mixerPolicyLimitMemory:      4096,
    }

    setProperties(this, {
      config,
      allowSystemGroup:          true,
    });
  },

  initWorkloads() {
    WORKLOADS.map((w) => {
      defineProperty(this, `${ w }SchedulableNodes`, computed(`${ w }NodeSelectors.[]`, 'cluster.nodes.@each.{allocatable,requested}', `config.${ w }Enabled`, () => {
        return this.getSchedulableNodes(w)
      }));

      defineProperty(this, `insufficient${ ucFirst(w) }Cpu`, computed(`${ w }SchedulableNodes.@each.{allocatable,requested}`, `config.${ w }RequestCpu`, 'cluster.nodes.@each.{allocatable,requested}', () => {
        return this.getComponentInsufficient(w, 'cpu')
      }))

      defineProperty(this, `insufficient${ ucFirst(w) }Memory`, computed(`${ w }SchedulableNodes.@each.{allocatable,requested}`, `config.${ w }RequestMemory`, 'cluster.nodes.@each.{allocatable,requested}', () => {
        return this.getComponentInsufficient(w, 'memory')
      }))

      defineProperty(this, `${ w }Warning`, computed(`insufficient${ ucFirst(w) }Cpu`, `insufficient${ ucFirst(w) }Memory`, () => {
        return this.getComponentWarning(w)
      }))
    });
  },

  initAnswers() {
    let customAnswers = {};

    const answers = get(this, 'app.answers') || {};
    const answerKeys = Object.keys(ANSWER_TO_CONFIG) || []

    const mixerNodeSelector = {};
    const pilotNodeSelector = {}
    const gatewayNodeSelector = {}
    const tracingNodeSelector = {}
    const loadBalancerSourceRanges = [];

    Object.keys(answers).filter((key) => key.startsWith(MIXER_NODE_SELECTOR_PREFIX) ).map((k) => {
      let value = answers[k] || '';
      const key = k.replace(MIXER_NODE_SELECTOR_PREFIX, '').replace(/\\\./g, '.')

      mixerNodeSelector[key] = value
    });

    Object.keys(answers).filter((key) => key.startsWith(PILOT_NODE_SELECTOR_PREFIX) ).map((k) => {
      let value = answers[k] || '';
      const key = k.replace(PILOT_NODE_SELECTOR_PREFIX, '').replace(/\\\./g, '.')

      pilotNodeSelector[key] = value
    });

    Object.keys(answers).filter((key) => key.startsWith(GATEWAY_NODE_SELECTOR_PREFIX) ).map((k) => {
      let value = answers[k] || '';
      const key = k.replace(GATEWAY_NODE_SELECTOR_PREFIX, '').replace(/\\\./g, '.')

      gatewayNodeSelector[key] = value
    });

    Object.keys(answers).filter((key) => key.startsWith(TRACING_NODE_SELECTOR_PREFIX) ).map((k) => {
      let value = answers[k] || '';
      const key = k.replace(TRACING_NODE_SELECTOR_PREFIX, '').replace(/\\\./g, '.')

      tracingNodeSelector[key] = value
    });

    Object.keys(answers).filter((key) => key.startsWith(`${ LB_SOURCE_RANGES }[`) ).map((k) => {
      loadBalancerSourceRanges.pushObject(answers[k])
    })

    this.updateCpuMemoryPreRequest()

    setProperties(this, {
      mixerNodeSelector,
      pilotNodeSelector,
      gatewayNodeSelector,
      tracingNodeSelector,
      loadBalancerSourceRanges,
      'config.http2Port':         answers[HTTP2_PORT] || DEFAULT_HTTP2_PORT,
      'config.httpsPort':         answers[HTTPS_PORT] || DEFAULT_HTTPS_PORT,
    })

    this.initMembers()

    Object.keys(answers).forEach((key = '') => {
      if (key.startsWith(MIXER_NODE_SELECTOR_PREFIX)
          || key.startsWith(`${ LB_SOURCE_RANGES }[`)
          || key.startsWith(PILOT_NODE_SELECTOR_PREFIX)
          || key.startsWith(GATEWAY_NODE_SELECTOR_PREFIX)
          || key.startsWith(TRACING_NODE_SELECTOR_PREFIX)
          || key.startsWith(`${ MEMBERS }[`)
      ) {
        return
      }

      if (Object.keys(HIDDEN_KEYS).includes(key)) {
        return
      }

      if (Object.keys(NODE_PORT_KEYS).includes(key) || key === HTTP2_PORT || key === HTTPS_PORT) {
        return
      }

      if (answerKeys.includes(key)) {
        let value

        switch (key) {
        case PILOT_REQUEST_CPU:
        case MIXER_REQUEST_CPU:
        case MIXER_LIMIT_CPU:
        case PILOT_LIMIT_CPU:
        case TRACING_REQUEST_CPU:
        case TRACING_LIMIT_CPU:
        case GATEWAY_REQUEST_CPU:
        case GATEWAY_LIMIT_CPU:
        case POLICY_REQUEST_CPU:
        case POLICY_LIMIT_CPU:
          value = convertToMillis(answers[key] || '0')
          break;
        case PILOT_REQUEST_MEM:
        case PILOT_LIMIT_MEM:
        case MIXER_REQUEST_MEM:
        case MIXER_LIMIT_MEM:
        case TRACING_REQUEST_MEM:
        case TRACING_LIMIT_MEM:
        case GATEWAY_REQUEST_MEM:
        case GATEWAY_LIMIT_MEM:
        case POLICY_REQUEST_MEM:
        case POLICY_LIMIT_MEM:
          value = parseSi(answers[key] || '0', 1024) / 1048576
          break;
        default:
          value = answers[key]
        }

        return set(this, `config.${ ANSWER_TO_CONFIG[key] }`, value)
      }

      customAnswers[key] = answers[key];
      setProperties(this, { customAnswers, })
    });
  },

  getEnalbedWorkloads(answers) {
    const out = []

    if (answers['pilot.enabled'] === 'true') {
      out.push('pilot')
    }
    if (answers['mixer.enabled'] === 'true') {
      out.push('mixer.telemetry')
    }
    if (answers['mixer.policy.enabled'] === 'true') {
      out.push('mixer.policy')
    }
    if (answers['gateways.enabled'] === 'true') {
      out.push('gateways.istio-ingressgateway')
    }
    if (answers['tracing.enabled'] === 'true') {
      out.push('tracing')
    }

    return out;
  },

  doneSaving() {
    this.updateCpuMemoryPreRequest()
  },

  initMembers() {
    const { answers = {} } = get(this, 'app');
    const { globalStore } = this

    if (answers[`${ MEMBERS }[0].name`] === MEMBER_SYSYTEM && answers[`${ MEMBERS }[0].kind`] === 'Group') {
      set(this, 'allowSystemGroup', true)
    } else {
      set(this, 'allowSystemGroup', false)

      const users = globalStore.all('user')
      const keys = Object.keys(answers).filter((key = '') => /^global.members\[\d\].name$/g.test(key))

      const members = (keys || [])
        .filter((key) => {
          const kindKey = key.replace('.name', '.kind')
          const kind = answers[kindKey]

          return !(kind === MEMBER_GROUP && answers[key] === MEMBER_SYSYTEM)
        })
        .map((key) => {
          const kindKey = key.replace('.name', '.kind')
          const kind = answers[kindKey]
          let id = answers[key]

          if (kind === MEMBER_USER) {
            const filtered = users.filter((u) => (u.principalIds || []).includes(`local://${ id }`)).get('firstObject')

            if (filtered && filtered.principalIds) {
              const principalIds = filtered.principalIds || []

              if (principalIds.length > 1) {
                id = principalIds.filter((f) => f !== `local://${ id }`).get('firstObject')
              } else {
                id = filtered.principalIds.get('firstObject')
              }
            }
          }

          return get(this, 'globalStore').createRecord({
            type: 'member',
            id,
          })
        })

      const membersPromises = (members || []).map((m) => globalStore.find('principal', m.id));

      PromiseAll(membersPromises).then((res) => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }
        set(this, 'members', res)
      })
    }
  },
});
