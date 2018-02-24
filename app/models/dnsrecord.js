import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { arrayOfReferences } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

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
      return 'arecord';
    }

    if ( get(this, 'hostname') ) {
      return 'cname';
    }

    if ( get(this, 'targetDnsRecordIds.length') ) {
      return 'alias';
    }

    if ( get(this, 'targetWorkloadIds.length') ) {
      return 'workload';
    }

    const selector = get(this, 'selector');
    if ( selector && Object.keys(selector).length ) {
      return 'selector';
    }


    return 'unknown';
  }),

  displayTarget: computed('recordType','ipAddresses.[]','hostname','selector','targetDnsRecords.[]','targetWorkloads.[]', function() {
    const selectors = get(this, 'selector')||{};
    const records = get(this, 'targetDnsRecords')||[];
    const workloads = get(this, 'targetWorkloads')||{};

    switch ( get(this, 'recordType') ) {
      case 'arecord':
        return get(this, 'ipAddresses').join('\n');
      case 'cname':
        return get(this, 'hostname');
      case 'selector':
        return Object.keys(selectors).map((k) => `${k}=${selectors[k]}`).join('\n');
      case 'alias':
        return records.map(x => get(x, 'displayName')).join('\n');
      case 'workload':
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
