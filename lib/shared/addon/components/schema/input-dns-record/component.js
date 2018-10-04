import { isArray } from '@ember/array';
import { get, set, observer, computed } from '@ember/object'
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  allDnsRecords: service(),

  layout,
  selected:          null,  // Selected dnsRecord ID
  selectClass:       'form-control',
  exclude:           null,  // ID or array of IDs to exclude from list
  selectedNamespace: null,
  culsterIpNotNull:  false,
  disabled:          false,

  value: null, // namespace/dnsRecordName string output

  // For other abuses
  obj: null,

  init() {
    this._super(...arguments);
    if (get(this, 'obj')) {
      set(this, 'selected', get(this, 'obj.id'));
    }
  },

  didRender() {
    this.selectedChanged();
  },

  selectedChanged: observer('selected', function() {
    let id = get(this, 'selected');
    let str = null;
    let dnsRecord = null;

    if (id) {
      dnsRecord = get(this, 'allDnsRecords').byId(id);
      if (dnsRecord) {
        str = `${ get(dnsRecord, 'namespace')  }/${  get(dnsRecord, 'name') }`;
      }
    }

    set(this, 'value', str);
    set(this, 'obj', dnsRecord);
  }),
  grouped: computed('allDnsRecords.list.[]', 'selectedNamespace', function() {
    let list = get(this, 'allDnsRecords.list');

    let exclude = get(this, 'exclude');

    if (exclude) {
      if (!isArray(exclude)) {
        exclude = [exclude];
      }

      list = list.filter((x) => !exclude.includes(x.id));
    }

    if (get(this, 'culsterIpNotNull')) {
      list = list.filter((x) => x.clusterIp !== null);
    }

    if (this.get('selectedNamespace')) {
      list = list.filter((x) => x.namespace === this.get('selectedNamespace.id'));
    }

    let out = get(this, 'allDnsRecords').group(list);
    let selected = get(this, 'allDnsRecords').byId(get(this, 'selected'));

    if (selected && !list.findBy('id', get(selected, 'id'))) {
      out['(Selected)'] = [{
        id:   get(selected, 'id'),
        name: get(selected, 'displayName'),
        kind: get(selected, 'type'),
        obj:  selected,
      }];
    }

    return out;
  }),

  readableService: computed('selected', function() {
    const { selected, selectedNamespace } = this;
    const service                         = get(selectedNamespace, 'services').findBy('id', selected);

    let out = 'N/A';

    if (service) {
      out = get(service, 'displayName');
    }

    return out;
  }),
});
