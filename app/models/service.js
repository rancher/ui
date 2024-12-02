import Resource from 'ember-api-store/models/resource';
import { reference, arrayOfReferences } from 'ember-api-store/utils/denormalize';
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

  selectedPods: computed('selector', 'store', function() {
    const rules = this.selector;
    let keys = Object.keys(rules);

    if ( !keys.length ) {
      return [];
    }

    let pods = this.store.all('pod');
    let key;

    for ( let i = 0 ; pods.length > 0 && i < keys.length ; i++ ) {
      key = keys[i];
      pods = pods.filter((p) => p.hasLabel(key, rules[key]));
    }

    return pods;
  }),

  nameWithType: computed('displayName', 'recordType', 'intl.locale', function() {
    const name =  this.displayName;
    const recordType =  this.recordType;
    const type = this.intl.t(`dnsPage.type.${  recordType }`);

    return `${ name } (${ type })`;
  }),

  availablePorts: computed('recordType', 'ports.@each.{targetPort,port}', function() {
    const list = [];
    const ports = this.ports;

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

      if ( this.hostname ) {
        return CNAME;
      }

      if ( get(this, 'targetDnsRecordIds.length') ) {
        return ALIAS;
      }

      if ( get(this, 'targetWorkloadIds.length') ) {
        return WORKLOAD;
      }

      const selector = this.selector;

      if ( selector && Object.keys(selector).length ) {
        return SELECTOR;
      }

      if ( this.clusterIp ) {
        return CLUSTERIP;
      }

      return UNKNOWN;
    }),

  displayType: computed('recordType', 'intl.locale', function() {
    return this.intl.t(`dnsPage.type.${  this.recordType }`);
  }),

  displayTarget: computed('clusterIp', 'hostname', 'ipAddresses.[]', 'recordType', 'selector', 'targetDnsRecords.[]', 'targetWorkloads.[]', function() {
    const selectors = this.selector || {};
    const records = this.targetDnsRecords || [];
    const workloads = this.targetWorkloads || {};

    switch ( this.recordType ) {
    case ARECORD:
      return this.ipAddresses.join('\n');
    case CNAME:
      return this.hostname;
    case SELECTOR:
      return Object.keys(selectors).map((k) => `${ k }=${ selectors[k] }`)
        .join('\n');
    case ALIAS:
      return records.map((x) => get(x, 'displayName')).join('\n');
    case WORKLOAD:
      return workloads.map((x) => get(x, 'displayName')).join('\n');
    case CLUSTERIP:
      return this.clusterIp;
    default:
      return 'Unknown';
    }
  }),

  selectorArray: computed('selector', function() {
    const selectors = this.selector || {};
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
    return !!get(this, 'links.update') && !this.isIngress;
  }),

  canRemove: computed('links.remove', 'isIngress', function() {
    return !!get(this, 'links.remove') && !this.isIngress;
  }),

  displayKind: computed('intl.locale', 'kind', function() {
    const intl = this.intl;

    if ( this.kind === 'LoadBalancer' ) {
      return intl.t('model.service.displayKind.loadBalancer');
    } else {
      return intl.t('model.service.displayKind.generic');
    }
  }),

  proxyEndpoints: computed('labels', 'name', 'namespaceId', 'ports', 'scope.currentCluster.id', function(){
    const parts = []
    const labels = this.labels;
    const location = window.location;

    if ( labels && labels['kubernetes.io/cluster-service'] === 'true' ) {
      (this.ports || []).forEach((port) => {
        let linkEndpoint = `${ location.origin }/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/api/v1/namespaces/${ this.namespaceId }/services/`;

        if ( get(port, 'name') === 'http' || get(port, 'name') === 'https' ) {
          linkEndpoint += `${ get(port, 'name') }:`;
        }
        linkEndpoint += `${ this.name }:${ get(port, 'port') }/proxy/`;

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
      this.router.transitionTo('authenticated.project.dns.detail.edit', this.id);
    },

    clone() {
      this.router.transitionTo('authenticated.project.dns.new', this.projectId, { queryParams: { id: this.id } });
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
