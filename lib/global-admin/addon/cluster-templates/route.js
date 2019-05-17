import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore:         service(),

  model() {
    const { globalStore: gs } = this;

    return hash({
      clusterTemplates:         gs.findAll('clustertemplate'),
      clusterTemplateRevisions: gs.findAll('clustertemplaterevision'),
    });
  }
});
