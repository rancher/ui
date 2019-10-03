import { get, set, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';

function convert(obj, intl) {
  const namespace = get(obj, 'namespaceId');
  const name = get(obj, 'displayName');

  return {
    group:     intl.t('allWorkloads.namespace', { name: namespace }),
    combined:  `${ namespace  }/${  name }`,
    namespace,
    id:        get(obj, 'id'),
    clusterIp: get(obj, 'clusterIp'),
    name,
    kind:      get(obj, 'type'),
    obj,
  };
}

export default Service.extend({
  intl:  service(),
  store: service(),
  app:   service(),

  _allDnsRecords: null,

  init() {
    this._super(...arguments);
    const store = get(this, 'store');

    set(this, '_allDnsRecords', store.all('service'));
  },

  dnsRecords: computed('_allDnsRecords.@each.{id,namespaceId,displayName,type}', function() {
    const intl = get(this, 'intl');

    return get(this, '_allDnsRecords').filter((x) => get(x, 'ownerReferences.firstObject.kind') !== 'Ingress').map((x) => convert(x, intl)).sortBy('combined');
  }),

  list: alias('dnsRecords'),

  grouped: computed('list.[]', function() {
    return this.group(get(this, 'list'));
  }),

  byId(id) {
    return get(this, '_allDnsRecords').findBy('id', id);
  },

  group(list) {
    const out = {};

    list.slice().sortBy('group', 'name', 'id').forEach((obj) => {
      let ary = out[obj.group];

      if (!ary) {
        ary = [];
        out[obj.group] = ary;
      }

      ary.push(obj);
    });

    return out;
  },

  matching(nameOrCombined, defaultNamespace) {
    // If the defaultNamespace is an object, convert to a name
    if (defaultNamespace && typeof defaultNamespace === 'object') {
      defaultNamespace = get(defaultNamespace, 'name');
    }

    // If the input has no namespace, add the default one
    let combined = nameOrCombined;

    if (defaultNamespace && !nameOrCombined.includes('/')) {
      combined = `${ defaultNamespace  }/${  nameOrCombined }`;
    }

    let match = get(this, 'list').findBy('combined', combined);

    if (match) {
      return match.obj;
    }
  },
});
