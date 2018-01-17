import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { hasMany } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { reference } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  access: service(),
  prefs: service(),
  scope: service(),
  settings: service(),
  modalService: service('modal'),
  router: service(),
  cookies: service(),

  type: 'project',
  name: null,
  description: null,

  cluster: reference('clusterId', 'cluster'),
  projectRoleTemplateBindings: hasMany('id', 'projectRoleTemplateBinding', 'projectId'), // 2.0 bug projectId is wrong in the ptrb should be <cluster-id>:<project-id> instead of just <project-id>

  actions: {
    edit: function () {
      this.get('router').transitionTo('authenticated.cluster.projects.edit', this.get('id'));
    },

    activate: function () {
      return this.doAction('activate').then(() => {
        return this.waitForState('active').then(() => {
          this.get('scope').refreshAll();
        });
      });
    },

    deactivate: function () {
      return this.doAction('deactivate').then(() => {
        if (this.get('active')) {
          window.location.href = window.location.href;
        }
      });
    },

    setAsDefault: function () {
      this.get('prefs').set(C.PREFS.PROJECT_DEFAULT, this.get('id'));
    },

    switchTo: function () {
      // @TODO bad
      window.lc('authenticated').send('switchProject', this.get('id'));
    },

    promptStop: function () {
      this.get('modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action: 'deactivate'
      });
    },
  },

  combinedState: computed('state', 'cluster.state', function() {
    var project = this.get('state');
    var cluster = this.get('cluster.state');

    if ( cluster === 'active' ) {
      return project;
    } else {
      return cluster;
    }
  }),

  availableActions: computed('actionLinks.{activate,deactivate}', 'links.{update,remove}', function () {
    // let a = this.get('actionLinks');
    // let l = this.get('links');

    var choices = [
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: true },
      { divider: true },
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', enabled: true, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link', action: 'goToApi', enabled: true },
    ];

    return choices;
  }),

  delete(/*arguments*/) {
    var promise = this._super.apply(this, arguments);
    return promise.then(() => {
      if (this.get('active')) {
        window.location.href = window.location.href;
      }
    }).catch((err) => {
      this.get('growl').fromError('Error deleting', err);
    });
  },

  icon: computed('active', function () {
    if (this.get('active')) {
      return 'icon icon-folder-open';
    }
    else {
      return 'icon icon-folder text-muted';
    }
  }),

  isDefault: computed(`prefs.${C.PREFS.PROJECT_DEFAULT}`, 'id', function () {
    return this.get(`prefs.${C.PREFS.PROJECT_DEFAULT}`) === this.get('id');
  }),

  active: computed(`cookies.${C.COOKIE.PROJECT}`, 'id', function () {
    return (this.get('id') === this.get('cookies').get(C.COOKIE.PROJECT));
  }),

  canSetDefault: computed('combinedState', 'isDefault', function () {
    return this.get('combinedState') === 'active' && !this.get('isDefault');
  }),
});
