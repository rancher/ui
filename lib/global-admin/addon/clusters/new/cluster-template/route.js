import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model(params) {
    const {
      cluster,
      clusterTemplates,
      clusterTemplateRevisions
    } = this.modelFor('clusters.new');

    const { provider } = params;

    return hash({
      cluster,
      provider,
      clusterTemplates,
      clusterTemplateRevisions,
    });
  }
});
