import { get, set, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';

function convert(obj, intl) {
  const namespace = get(obj, 'namespace.displayName');
  const name = get(obj, 'displayName');

  return {
    group:     intl.t('allWorkloads.namespace', { name: namespace }),
    combined:  `${ namespace  }/${  name }`,
    id:        get(obj, 'id'),
    stackName: namespace,
    name,
    kind:      get(obj, 'type'),
    obj,
  };
}

export default Service.extend({
  intl:  service(),
  store: service(),
  app:   service(),

  _allWorkloads: null,
  _allPods:      null,

  init() {
    this._super(...arguments);
    const store = get(this, 'store');

    set(this, '_allWorkloads', store.all('workload'));
    set(this, '_allPods', store.all('pod'));
  },

  workloads: computed('_allWorkloads.@each.{id,namespaceId,displayName,type}', function() {
    const intl = get(this, 'intl');

    return get(this, '_allWorkloads').map((x) => convert(x, intl)).sortBy('combined');
  }),

  pods: computed('_allPods.@each.{id,namespaceId,displayName,type}', function() {
    const intl = get(this, 'intl');

    return get(this, '_allPods').map((x) => convert(x, intl)).sortBy('combined');
  }),

  list: alias('workloads'),

  listWithPods: computed('workloads', 'pods', function() {
    const intl = get(this, 'intl');
    const out = get(this, '_allWorkloads').map((x) => convert(x, intl));

    out.pushObjects(get(this, '_allPods').map((x) => convert(x, intl)));

    return out.sortBy('combined');
  }),

  grouped: computed('list.[]', function() {
    return this.group(get(this, 'list'));
  }),

  groupedWithPods: computed('listWithPods.[]', function() {
    return this.group(get(this, 'listWithPods'));
  }),

  byId(id) {
    return this.get('_allWorkloads').findBy('id', id);
  },

  group(list) {
    const out = {};

    list.slice().sortBy('group', 'name', 'id').forEach((obj) => {
      let ary = out[obj.group];

      if ( !ary ) {
        ary = [];
        out[obj.group] = ary;
      }

      ary.push(obj);
    });

    return out;
  },

  matching(nameOrCombined, defaultNamespace, withPods = false) {
    // If the defaultNamespace is an object, convert to a name
    if ( defaultNamespace && typeof defaultNamespace === 'object' ) {
      defaultNamespace = get(defaultNamespace, 'name');
    }

    // If the input has no namespace, add the default one
    let combined = nameOrCombined;

    if ( defaultNamespace && !nameOrCombined.includes('/') ) {
      combined = `${ defaultNamespace  }/${  nameOrCombined }`;
    }

    const ary = ( withPods ? get(this, 'listWithPods') : get(this, 'list') );

    let match = ary.findBy('combined', combined);

    if ( match ) {
      return match.obj;
    }
  },
});
