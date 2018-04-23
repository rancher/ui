import { computed, get } from '@ember/object';
import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

export default Resource.extend({
  type: 'ingress',

  clusterStore: service(),
  router: service(),
  namespace: reference('namespaceId', 'namespace', 'clusterStore'),

  targets: computed('rules.@each.paths', function() {
    const out = [];
    const store = get(this, 'store');

    let tlsHosts = [];
    (get(this, 'tls')||[]).forEach((entry) => {
      tlsHosts.addObjects(entry.hosts||[]);
    });
    tlsHosts = tlsHosts.uniq();

    let entries, entry, reference;
    (get(this,'rules')||[]).forEach((rule) => {
      entries = get(rule, 'paths')||{};
      Object.keys(entries).forEach((path) => {
        entry = entries[path];

        if ( entry.serviceId ) {
          reference = store.getById('service', entry.serviceId);
          out.push({
            host: rule.host,
            tls: tlsHosts.includes(rule.host),
            path: path,
            refernece: entry.serviceId,
            service: reference,
          });
        } else if ( entry.workloadIds ) {
          (entry.workloadIds||[]).forEach((id) => {
            reference = store.getById('workload', id);
            out.push({
              host: rule.host,
              tls: tlsHosts.includes(rule.host),
              path: path,
              refernece: id,
              workload: reference,
            });
          });
        }
      });
    });

    return out;
  }),

  actions: {
    edit: function () {
      get(this,'router').transitionTo('ingresses.run', {queryParams: {
        ingressId: get(this, 'id'),
        upgrade: true,
      }});
    },
  },
});
