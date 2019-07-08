import Controller from '@ember/controller';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  router: service(),

  clusterTemplateRevisionId: null,

  actions: {
    save() {
      if (this.clusterTemplateRevisionId) {
        this.router.transitionTo('global-admin.clusters.new.launch', this.model.provider, { queryParams: { clusterTemplateRevision: this.clusterTemplateRevisionId } });
      } else {
        this.router.transitionTo('global-admin.clusters.new.launch', this.model.provider, { queryParams: { clusterTemplateRevision: null } });
      }
    },
    cancel() {
      this.router.transitionTo('global-admin.clusters.new')
    }
  },

  allTemplates: computed('model.clusterTemplates.[]', 'model.clusterTemplateRevisions.[]', function() {
    const remapped = [];
    let { clusterTemplates, clusterTemplateRevisions } = this.model;

    clusterTemplates         = clusterTemplates.filterBy('enabled');
    clusterTemplateRevisions = clusterTemplateRevisions.filterBy('enabled');

    clusterTemplateRevisions.forEach((rev) => {
      let match = clusterTemplates.findBy('id', get(rev, 'clusterTemplateId'));

      remapped.pushObject({
        clusterTemplateId:           get(match, 'id'),
        clusterTemplateName:         get(match, 'displayName'),
        clusterTemplateRevisionId:   get(rev, 'id'),
        clusterTemplateRevisionName: get(rev, 'name'),
      });
    });

    return remapped;
  }),

});
