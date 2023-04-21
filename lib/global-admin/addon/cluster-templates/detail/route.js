import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:      service(),
  clusterTemplates: service(),

  model(params) {
    return this.globalStore.find('clustertemplaterevision', params.template_revision_id).then((revision) => {
      let clusterTemplate;

      if (revision.clusterTemplate) {
        clusterTemplate = revision.clusterTemplate;
      } else {
        clusterTemplate = this.globalStore.find('clusterTemplate', revision.clusterTemplateId);
      }

      return hash({
        clusterTemplate,
        clusterTemplateRevision:   revision,
        psps:                      this.globalStore.findAll('podSecurityPolicyTemplate'),
        clusterTemplateRevisionId: revision.id,
      });
    });
  },

  afterModel() {
    return this.clusterTemplates.fetchQuestionsSchema();
  },
});
