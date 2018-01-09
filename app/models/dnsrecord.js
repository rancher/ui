import Resource from 'ember-api-store/models/resource';
import { computed, get } from '@ember/object';
import { arrayOfReferences } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  targetDnsRecords: arrayOfReferences('targetDnsRecordIds'),
  targetWorkloads: arrayOfReferences('targetWorkloadIds'),

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

  recordType: computed('ipAddresses.length','hostname','selector','targetDnsRecordIds.length','targetWorkloadIds.length', function() {
    if ( get(this, 'ipAddresses.length')) {
      return 'arecord';
    }

    if ( get(this, 'hostname') ) {
      return 'cname';
    }

    const selector = get(this, 'selector');
    if ( selector && Object.keys(selector).length ) {
      return 'selector';
    }

    if ( get(this, 'targetDnsRecordIds.length') || get(this, 'targetWorkloadIds.length') ) {
      return 'alias';
    }

    return 'unknown';
  }),

  displayTarget: computed('recordType','ipAddresses.[]','hostname','selector','targetDnsRecords.[]','targetWorkloads.[]', function() {
    switch ( get(this, 'recordType') ) {
      case 'arecord':
        const addresses = get(this, 'ipAddresses');
        if ( addresses.length > 2 ) {
          let other = addresses.length - 1;
          return address[0] + ' and ' + other + ' others';
        }
        return get(this, 'ipAddresses').join(', ')
      case 'cname':
        return get(this, 'hostname');
        break;
      case 'selector':
        return get(this, 'selector');
        break;
      case 'alias':
        return 'Some things'
        break;
      default:
        return 'Unknown';
    }
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
