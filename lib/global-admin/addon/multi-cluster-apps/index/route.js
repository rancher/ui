import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  catalog:     service(),

  beforeModel() {
    return hash({
      templateversions: this.globalStore.find('templateversion'),
      templates:        this.catalog.fetchTemplates(),
    });
  },

  model() {
    return this.globalStore.findAll('multiclusterapp').then( (resp) => ({ apps: resp }));
  },

});
