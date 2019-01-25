import { computed, get } from '@ember/object';
import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

export default Resource.extend({
  clusterStore:  service(),
  router:        service(),

  type:          'ingress',

  canClone:      true,
  canHaveLabels: true,

  namespace:     reference('namespaceId', 'namespace', 'clusterStore'),

  targets: computed('rules.@each.paths', function() {
    const out = [];
    const store = get(this, 'store');

    let tlsHosts = [];

    (get(this, 'tls') || []).forEach((entry) => {
      tlsHosts.addObjects(entry.hosts || []);
    });
    tlsHosts = tlsHosts.uniq();


    let def = get(this, 'defaultBackend');

    if ( def ) {
      addRow(null, null, def);
    }

    (get(this, 'rules') || []).forEach((rule) => {
      let entries = get(rule, 'paths') || [];

      entries.forEach((entry) => {
        addRow(rule.host, get(entry, 'path'), entry);
      });
    });

    function addRow(host, path, entry) {
      let reference;

      if ( entry.serviceId ) {
        reference = store.getById('service', entry.serviceId);
        out.push({
          host,
          tls:       tlsHosts.includes(host),
          path,
          reference: entry.serviceId,
          service:   reference,
        });
      } else if ( entry.workloadIds ) {
        (entry.workloadIds || []).forEach((id) => {
          reference = store.getById('workload', id);
          out.push({
            host,
            tls:       tlsHosts.includes(host),
            path,
            reference: id,
            workload:  reference,
          });
        });
      }
    }

    return out;
  }),

  displayKind: computed('intl.locale', function() {
    const intl = get(this, 'intl');

    return intl.t('model.ingress.displayKind');
  }),
  actions:      {
    edit() {
      get(this, 'router').transitionTo('ingresses.run', {
        queryParams: {
          ingressId: get(this, 'id'),
          upgrade:   true,
        }
      });
    },

    clone() {
      get(this, 'router').transitionTo('ingresses.run', {
        queryParams: {
          ingressId: get(this, 'id'),
          upgrade:   false,
        }
      });
    },
  },

});
