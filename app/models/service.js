import Resource from '@rancher/ember-api-store/models/resource';
import { reference, arrayOfReferences } from '@rancher/ember-api-store/utils/denormalize';
import { computed, get, set } from '@ember/object';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import EndpointPorts from 'ui/mixins/endpoint-ports';

export const ARECORD = 'arecord';
export const CNAME = 'cname';
export const ALIAS = 'alias';
export const WORKLOAD = 'workload';
export const SELECTOR = 'selector';
export const CLUSTERIP = 'clusterIp';
export const UNKNOWN = 'unknown';

const FIELD_MAP = {
  [ARECORD]:   'ipAddresses',
  [CNAME]:     'hostname',
  [ALIAS]:     'targetDnsRecordIds',
  [WORKLOAD]:  'targetWorkloadIds',
  [SELECTOR]:  'selector',
};

var Service = Resource.extend(EndpointPorts, {
  clusterStore:     service(),
  router:           service(),
  intl:             service(),
  scope:            service(),
  namespace:        reference('namespaceId', 'namespace', 'clusterStore'),
  targetDnsRecords: arrayOfReferences('targetDnsRecordIds', 'service'),
  targetWorkloads:  arrayOfReferences('targetWorkloadIds', 'workload'),

  isIngress: equal('ownerReferences.firstObject.kind', 'Ingress'),

  selectedPods: computed('selector', function() {
    const rules = get(this, 'selector');
    let keys = Object.keys(rules);

    if ( !keys.length ) {
      return [];
    }

    let pods = get(this, 'store').all('pod');
    let key;

    for ( let i = 0 ; pods.length > 0 && i < keys.length ; i++ ) {
      key = keys[i];
      pods = pods.filter((p) => p.hasLabel(key, rules[key]));
    }

    return pods;
  }),

  nameWithType: computed('displayName', 'recordType', 'intl.locale', function() {
    const name =  get(this, 'displayName');
    const recordType =  get(this, 'recordType');
    const type = get(this, 'intl').t(`dnsPage.type.${  recordType }`);

    return `${ name } (${ type })`;
  }),

  availablePorts: computed('recordType', 'ports.@each.{targetPort,port}', function() {
    const list = [];
    const ports = get(this, 'ports');

    ports.forEach((p) => {
      list.push(p.targetPort.toString());
      list.push(p.port.toString());
      list.push(get(p, 'name'));
    });

    return list.uniq().map((p) => ({ port: p })).sortBy('port');
  }),

  recordType: computed(
    'ipAddresses.length',
    'hostname',
    'selector',
    'targetDnsRecordIds.length',
    'targetWorkloadIds.length',
    'clusterIp', function() {
      if ( get(this, 'ipAddresses.length')) {
        return ARECORD;
      }

      if ( get(this, 'hostname') ) {
        return CNAME;
      }

      if ( get(this, 'targetDnsRecordIds.length') ) {
        return ALIAS;
      }

      if ( get(this, 'targetWorkloadIds.length') ) {
        return WORKLOAD;
      }

      const selector = get(this, 'selector');

      if ( selector && Object.keys(selector).length ) {
        return SELECTOR;
      }

      if ( get(this, 'clusterIp') ) {
        return CLUSTERIP;
      }

      return UNKNOWN;
    }),

  displayType: computed('recordType', 'intl.locale', function() {
    return get(this, 'intl').t(`dnsPage.type.${  get(this, 'recordType') }`);
  }),

  displayTarget: computed('recordType', 'ipAddresses.[]', 'hostname', 'selector', 'targetDnsRecords.[]', 'targetWorkloads.[]', function() {
    const selectors = get(this, 'selector') || {};
    const records = get(this, 'targetDnsRecords') || [];
    const workloads = get(this, 'targetWorkloads') || {};

    switch ( get(this, 'recordType') ) {
    case ARECORD:
      return get(this, 'ipAddresses').join('\n');
    case CNAME:
      return get(this, 'hostname');
    case SELECTOR:
      return Object.keys(selectors).map((k) => `${ k }=${ selectors[k] }`)
        .join('\n');
    case ALIAS:
      return records.map((x) => get(x, 'displayName')).join('\n');
    case WORKLOAD:
      return workloads.map((x) => get(x, 'displayName')).join('\n');
    case CLUSTERIP:
      return get(this, 'clusterIp');
    default:
      return 'Unknown';
    }
  }),

  selectorArray: computed('selector', function() {
    const selectors = get(this, 'selector') || {};
    const out = [];

    Object.keys(selectors).map((k) => {
      out.push({
        key:   k,
        value: selectors[k]
      });
    });

    return out;
  }),

  canEdit: computed('links.update', 'isIngress', function() {
    return !!get(this, 'links.update') && !get(this, 'isIngress');
  }),

  canRemove: computed('links.remove', 'isIngress', function() {
    return !!get(this, 'links.remove') && !get(this, 'isIngress');
  }),

  displayKind: computed('intl.locale', 'kind', function() {
    const intl = get(this, 'intl');

    if ( get(this, 'kind') === 'LoadBalancer' ) {
      return intl.t('model.service.displayKind.loadBalancer');
    } else {
      return intl.t('model.service.displayKind.generic');
    }
  }),

  proxyEndpoints: computed('labels', function(){
    const parts = []
    const labels = get(this, 'labels');
    const location = window.location;

    if ( labels && labels['kubernetes.io/cluster-service'] === 'true' ) {
      (get(this, 'ports') || []).forEach((port) => {
        let linkEndpoint = `${ location.origin }/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/api/v1/namespaces/${ get(this, 'namespaceId') }/services/`;

        if ( get(port, 'name') === 'http' || get(port, 'name') === 'https' ) {
          linkEndpoint += `${ get(port, 'name') }:`;
        }
        linkEndpoint += `${ get(this, 'name') }:${ get(port, 'port') }/proxy/`;

        parts.push({
          linkEndpoint,
          displayEndpoint: '/index.html',
          protocol:        location.protocol.substr(0, location.protocol.length - 1),
          isTcpish:        true,
          isReady:         true,
        });
      });
    }

    return parts;
  }),

  actions:      {
    edit() {
      get(this, 'router').transitionTo('authenticated.project.dns.detail.edit', this.get('id'));
    },

    clone() {
      get(this, 'router').transitionTo('authenticated.project.dns.new', this.get('projectId'), { queryParams: { id: this.get('id') } });
    },
  },

  clearTypesExcept(type) {
    Object.keys(FIELD_MAP).forEach((key) => {
      if ( key !== type ) {
        set(this, FIELD_MAP[key], null);
      }
    });
  },
});

Service.reopenClass({
  mangleIn(data) {
    if ( data ) {
      const publicEndpoints = get(data, 'publicEndpoints') || [];

      publicEndpoints.forEach((endpoint) => {
        endpoint.type = 'publicEndpoint';
      });
    }

    return data;
  }
});

export default Service;
