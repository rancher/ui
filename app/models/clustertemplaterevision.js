import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { computed, set } from '@ember/object';

export default Resource.extend({
  globalStore: service(),
  router:      service(),

  type:            'clustertemplaterevision',

  clusterTemplate: reference('clusterTemplateId', 'clusterTemplate', 'globalStore'),

  canBulkRemove: computed('clusterTemplateId', function() {
    let { clusterTemplate } = this;

    if (clusterTemplate && clusterTemplate.defaultRevisionId && clusterTemplate.defaultRevisionId !== this.id) {
      return true;
    }

    return false;
  }),

  availableActions: computed('actionLinks.[]', () => {
    return [
      {
        label:     'action.cloneRevision',
        icon:      'icon icon-copy',
        action:    'newRevision',
        enabled:   true,
      },
    ];
  }),

  actions: {
    newRevision() {
      this.router.transitionTo('global-admin.cluster-templates.new-revision', this.clusterTemplateId, { queryParams: { revision: this.id } });
    }
  },

  fetchQuestionsSchema() {
    return this.globalStore.rawRequest({
      url:    'clusterTemplateRevisions?action=listquestions',
      method: 'POST',
    }).then((resp) => {
      if (resp.body) {
        set(this, 'questionsSchemas', JSON.parse(resp.body));
      }
    });
  },

  validationErrors() {
    let errors = [];

    if (errors.length > 0) {
      return errors;
    }

    errors = this._super(...arguments);

    return errors;
  },
});
