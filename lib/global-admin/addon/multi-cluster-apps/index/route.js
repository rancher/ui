import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { allSettled } from 'rsvp';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),
  catalog:     service(),
  growl:       service(),
  intl:        service(),

  model() {
    return this.globalStore.findAll('multiclusterapp').then( (resp) => ({ apps: resp }));
  },

  afterModel(model/* , transition */) {
    let promises = [];

    get(model, 'apps').forEach((app) => {
      promises.push(this.catalog.fetchTemplate(get(app, 'templateVersionId'), true));
    });

    // we don't have to retrun the promise here because this data is really needed for the upgrade data. because we dont have it doesn't mean we should crash the page.
    allSettled(promises).then(() => {
      this.catalog.fetchMultiClusterAppTemplates(get(model, 'apps'));
    });

    return;
  },

});
