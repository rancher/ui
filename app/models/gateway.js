import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Resource.extend({
  clusterStore:  service(),
  router:        service(),

  canHaveLabels:      true,
  namespace:          reference('namespaceId', 'namespace', 'clusterStore'),

  displayHosts: computed('servers.@each.hosts', function() {
    const out = [];
    const servers = this.servers || [];

    servers.forEach((server) => {
      (server.hosts || []).forEach((host) => {
        out.push(host);
      });
    });

    return out;
  }),

  displayHostsString: computed('displayHosts.[]', function() {
    return this.displayHosts.join(', ');
  }),

  displaySelectorStrings: computed('selector', function() {
    const out = [];
    const selector = this.selector || {};

    Object.keys(selector).forEach((key) => {
      out.push(`${ key }=${ selector[key] }`);
    });

    return out.sort();
  }),

  actions:      {
    edit() {
      this.router.transitionTo('authenticated.project.istio.gateway.detail.edit', this.id);
    },

    clone() {
      this.router.transitionTo('authenticated.project.istio.gateway.new', this.projectId, { queryParams: { id: this.id } });
    },
  },

});
