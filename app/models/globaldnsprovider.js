import Resource from 'ember-api-store/models/resource';
import { get, computed, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Resource.extend({
  router:   service(),
  config:   null,
  provider: null,

  // I think its safe to hack around this - wjw
  _displayState: 'active',
  // because of this the state shows as "Unknown" with bright yellow background
  stateColor:    'text-success',

  init() {
    this._super(...arguments);

    if (this.route53ProviderConfig) {
      setProperties(this, {
        config:   alias('route53ProviderConfig'),
        provider: 'route53'
      });
    }

    if (this.cloudflareProviderConfig) {
      setProperties(this, {
        config:   alias('cloudflareProviderConfig'),
        provider: 'cloudflare'
      });
    }

    if (this.alidnsProviderConfig) {
      setProperties(this, {
        config:   alias('alidnsProviderConfig'),
        provider: 'alidns'
      });
    }
  },

  canEdit: computed('links.update', function() {
    return !!get(this, 'links.update');
  }),

  canRemove: computed('links.remove', function() {
    return !!get(this, 'links.remove');
  }),

  actions: {
    edit() {
      this.router.transitionTo('global-admin.global-dns.providers.new', { queryParams: { id: this.id } } );
    }
  },

});
