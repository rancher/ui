import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Resource.extend({
  globalStore: service(),
  router:      service(),
  growl:       service(),
  intl:        service(),

  type:            'clustertemplaterevision',

  clusterTemplate:  reference('clusterTemplateId', 'clusterTemplate', 'globalStore'),
  canRemove:        alias('canMakeDefault'),

  combinedState: computed('enabled', function() {
    if ( get(this, 'enabled') ) {
      return 'active';
    }

    return 'disabled';
  }),

  canMakeDefault: computed('clusterTemplate.defaultRevisionId', function() {
    let defaultRevisionId = get(this, 'clusterTemplate.defaultRevisionId') || null;

    if (defaultRevisionId) {
      return this.id !== defaultRevisionId;
    }

    return false;
  }),

  availableActions: computed('actionLinks.[]', 'enabled', 'clusterTemplate.defaultRevisionId', function() {
    const a = get(this, 'actionLinks') || {};

    return [
      {
        label:    'generic.enable',
        icon:     'icon icon-play',
        action:   'enable',
        enabled:  !!a.enable,
        bulkable: true,
      },
      {
        label:    'generic.disable',
        icon:     'icon icon-stop',
        action:   'disable',
        enabled:  !!a.disable,
        bulkable: true,
      },
      {
        label:    'action.makeDefault',
        icon:     'icon icon-success',
        action:   'setDefault',
        enabled:  this.canMakeDefault,
      },
      {
        label:    'action.cloneRevision',
        icon:     'icon icon-copy',
        action:   'newRevision',
        enabled:  true,
      },
    ];
  }),

  actions: {
    newRevision() {
      this.router.transitionTo('global-admin.cluster-templates.new-revision', this.clusterTemplateId, { queryParams: { revision: this.id } });
    },

    setDefault() {
      const { clusterTemplate } = this;
      const successTitle   = this.intl.t('action.setDefaultRevision.success.title');
      const successMessage = this.intl.t('action.setDefaultRevision.success.message', {
        name:   this.displayName,
        ctName: this.clusterTemplate.displayName,
      });

      set(clusterTemplate, 'defaultRevisionId', this.id);

      clusterTemplate.save()
        .then(() => this.growl.success(successTitle, successMessage))
        .catch((err) => this.growl.fromError(err));
    },

    disable() {
      this.doAction('disable')
        .catch((err) => {
          set(this, 'enabled', true);

          this.growl.fromError(err);

          return err;
        });
    },

    enable() {
      this.doAction('enable')
        .catch((err) => {
          set(this, 'enabled', false);

          this.growl.fromError(err);

          return err;
        });
    },
  },

  validationErrors() {
    let errors = [];

    if (!get(this, 'name')) {
      errors.push('Revision name is required');
    }

    if (errors.length > 0) {
      return errors;
    }

    return errors;
  },
});
