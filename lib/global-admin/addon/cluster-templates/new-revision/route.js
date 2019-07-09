import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:      service(),
  clusterTemplates: service(),

  model(params) {
    return this.globalStore.find('clustertemplate', params.template_id).then((template) => {
      return this.globalStore.findAll('clustertemplaterevision').then((revisions) => {
        let tempRevision = null;
        let tempId = null;

        if (template.defaultRevisionId) {
          if (params.revision) {
            tempRevision = revisions.findBy('id', params.revision).cloneForNew();
            tempId       = params.revision;
          } else {
            tempRevision = revisions.findBy('id', template.defaultRevisionId).cloneForNew();
            tempId       = template.defaultRevisionId;
          }

          return hash({
            clusterTemplate:           template,
            clusterTemplateRevision:   tempRevision,
            psps:                      this.globalStore.findAll('podSecurityPolicyTemplate'),
            clusterTemplateRevisionId: tempId,
          });
        } else {
          if (params.revision) {
            tempRevision = revisions.findBy('id', params.revision).cloneForNew();
            tempId = params.revision;
          } else {
            tempRevision = get(revisions, 'firstObject').cloneForNew();
            tempId = get(revisions, 'firstObject').defaultRevisionId;
          }

          return hash({
            clusterTemplate:           template,
            clusterTemplateRevision:   tempRevision,
            psps:                      this.globalStore.findAll('podSecurityPolicyTemplate'),
            clusterTemplateRevisionId: tempId,
          });
        }
      });
    })
  },

  afterModel() {
    return this.clusterTemplates.fetchQuestionsSchema();
  },

  queryParams: { revision: { refreshModel: true } },
});
