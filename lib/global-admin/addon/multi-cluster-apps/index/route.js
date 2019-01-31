import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),
  catalog:     service(),

  model() {
    return this.globalStore.findAll('multiclusterapp').then( (resp) => ({ apps: resp }));
  },

  afterModel(model/* , transition */) {
    let promises = [];

    get(model, 'apps').forEach((app) => {
      promises.push(this.catalog.fetchTemplate(get(app, 'templateVersionId'), true));
    });

    return all(promises).then(() => {
      return this.catalog.fetchMultiClusterAppTemplates(get(model, 'apps'));
    });
  },

});
