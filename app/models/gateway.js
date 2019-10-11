import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';

export default Resource.extend({
  clusterStore:  service(),
  router:        service(),

  canHaveLabels:      true,
  namespace:          reference('namespaceId', 'namespace', 'clusterStore'),

  displayHosts: computed('servers.@each.hosts', function() {
    const out = [];
    const servers = get(this, 'servers') || [];

    servers.forEach((server) => {
      (get(server, 'hosts') || []).forEach((host) => {
        out.push(host);
      });
    });

    return out;
  }),

  displayHostsString: computed('displayHosts.[]', function() {
    return get(this, 'displayHosts').join(', ');
  }),

  displaySelectorStrings: computed('selector', function() {
    const out = [];
    const selector = get(this, 'selector') || {};

    Object.keys(selector).forEach((key) => {
      out.push(`${ key }=${ selector[key] }`);
    });

    return out.sort();
  }),

  actions:      {
    edit() {
      get(this, 'router').transitionTo('authenticated.project.istio.gateway.detail.edit', get(this, 'id'));
    },

    clone() {
      get(this, 'router').transitionTo('authenticated.project.istio.gateway.new', get(this, 'projectId'), { queryParams: { id: get(this, 'id') } });
    },
  },

});
