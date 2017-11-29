import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { next } from '@ember/runloop';

import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var PodSecurityPolicyTemplate = Resource.extend(PolledResource, {
  type: 'podSecurityPolicyTemplate',
  router: service(),

  actions: {
    edit: function() {
      this.get('router').transitionTo('global-admin.policies.edit', this.get('id'));
    },
  },

  availableActions: function () {
    return [
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: true },
      { divider: true },
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', enabled: true, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link', action: 'goToApi', enabled: true },
    ];
  }.property(),

  delete: function (/*arguments*/) {
    var promise = this._super.apply(this, arguments);
    return promise.then(() => {
      this.set('state', 'removed');
    }).catch((err) => {
      this.get('growl').fromError('Error deleting', err);
    });
  },
});

PodSecurityPolicyTemplate.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default PodSecurityPolicyTemplate;
