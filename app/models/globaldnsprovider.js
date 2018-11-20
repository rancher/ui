import Resource from '@rancher/ember-api-store/models/resource';
import { get, computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Resource.extend({
  router: service(),
  config: null,

  // I think its safe to hack around this - wjw
  _displayState: 'active',
  // because of this the state shows as "Unknown" with bright yellow background
  stateColor:    'text-success',

  init() {
    this._super(...arguments);

    if (get(this, 'route53ProviderConfig')) {
      set(this, 'config', alias('route53ProviderConfig'));
    }
  },

  rootDomain: computed('config.{rootDomain}', function() {
    return get(this, 'config.rootDomain');
  }),


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
