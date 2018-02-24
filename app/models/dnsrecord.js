import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { computed, get, set } from '@ember/object';
import { arrayOfReferences } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

export const ARECORD = 'arecord';
export const CNAME = 'cname';
export const ALIAS = 'alias';
export const WORKLOAD = 'workload';
export const SELECTOR = 'selector';
export const UNKNOWN = 'unknown';

export default Resource.extend({
  clusterStore: service(),
  namespace: reference('namespaceId', 'namespace', 'clusterStore'),
  targetDnsRecords: arrayOfReferences('targetDnsRecordIds','dnsRecord'),
  targetWorkloads: arrayOfReferences('targetWorkloadIds','workload'),

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
      pods = pods.filter(p => p.hasLabel(key, rules[key]));
    }

    return pods;
  }),

  recordType: computed(
  'ipAddresses.length',
  'hostname',
  'selector',
  'targetDnsRecordIds.length',
  'targetWorkloadIds.length', function() {

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


    return UNKNOWN;
  }),

  clearTypesExcept(type) {
    const fields = ['ipAddresses','hostname','targetDnsRecordIds','targetWorkloadIds','selector'];
    let keep = null;

    switch ( type ) {
      case ARECORD:  keep = 'ipAddresses';      break;
      case CNAME:    keep = 'hostname';         break;
      case ALIAS:    keep = 'targetDnsRecords'; break;
      case WORKLOAD: keep = 'targetWorkloads';  break;
      case SELECTOR: keep = 'selector';         break;
    }

    fields.removeObject(keep);
    fields.forEach((key) => {
      set(this, key, null);
    });
  },

  displayTarget: computed('recordType','ipAddresses.[]','hostname','selector','targetDnsRecords.[]','targetWorkloads.[]', function() {
    const selectors = get(this, 'selector')||{};
    const records = get(this, 'targetDnsRecords')||[];
    const workloads = get(this, 'targetWorkloads')||{};

    switch ( get(this, 'recordType') ) {
      case ARECORD:
        return get(this, 'ipAddresses').join('\n');
      case CNAME:
        return get(this, 'hostname');
      case SELECTOR:
        return Object.keys(selectors).map((k) => `${k}=${selectors[k]}`).join('\n');
      case ALIAS:
        return records.map(x => get(x, 'displayName')).join('\n');
      case WORKLOAD:
        return workloads.map(x => get(x, 'displayName')).join('\n');
      default:
        return 'Unknown';
    }
  }),

  selectorArray: computed('selector', function() {
    const selectors = get(this, 'selector')||{};
    const out = [];
    Object.keys(selectors).map((k) => {
      out.push({key: k, value: selectors[k]});
    });

    return out;
  }),

  availableActions: computed('links.{update,remove}', function() {
    var l = get(this, 'links');

    var choices = [
      { label: 'action.edit',       icon: 'icon icon-edit',           action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',          action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',  action: 'goToApi',      enabled: true },
    ];

    return choices;
  }),
});
