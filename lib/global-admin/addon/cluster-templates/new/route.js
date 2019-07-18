import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:      service(),
  access:           service(),
  clusterTemplates: service(),

  model() {
    return hash({
      clusterTemplate:         this.globalStore.createRecord({ type: 'clustertemplate', }),
      clusterTemplateRevision: this.globalStore.createRecord({
        type:          'clusterTemplateRevision',
        enabled:       true,
        clusterConfig: this.globalStore.createRecord({
          type:                          'clusterSpecBase',
          rancherKubernetesEngineConfig: this.globalStore.createRecord({ type: 'rancherKubernetesEngineConfig' })
        })
      }),
      psps:  this.globalStore.findAll('podSecurityPolicyTemplate'),
      users: this.globalStore.findAll('user'),
    });
  },

  afterModel() {
    return this.clusterTemplates.fetchQuestionsSchema();
  }
});
