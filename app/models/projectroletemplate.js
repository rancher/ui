import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var ProjectRoleTemplate = Resource.extend(PolledResource, {
  type: 'projectRoleTemplate',
  router: service(),

  actions: {
    edit: function() {
      this.get('router').transitionTo('global-admin.security.roles.edit', this.get('id'));
    },
  },

  availableActions: function () {
    const builtIn = get(this,'builtin') === true;

    return [
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: !builtIn },
      { divider: true },
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', enabled: !builtIn, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link', action: 'goToApi', enabled: true },
    ];
  }.property('builtin'),

  delete: function (/*arguments*/) {
    var promise = this._super.apply(this, arguments);
    return promise.then(() => {
      this.set('state', 'removed');
    }).catch((err) => {
      this.get('growl').fromError('Error deleting', err);
    });
  },
});

ProjectRoleTemplate.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default ProjectRoleTemplate;
