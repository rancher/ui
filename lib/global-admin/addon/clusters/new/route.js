import Route from '@ember/routing/route';
// import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:         service(),

  model() {
    return hash({
      cluster:                  this.globalStore.createRecord({ type: 'cluster' }),
      kontainerDrivers:         this.globalStore.findAll('kontainerdriver'),
      nodeDrivers:              this.globalStore.findAll('nodeDriver'),
      clusterTemplates:         this.globalStore.findAll('clustertemplate'),
      clusterTemplateRevisions: this.globalStore.findAll('clustertemplaterevision'),
    });
  },
});
