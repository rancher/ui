import { get } from '@ember/object';
import { all } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { /* parseExternalId, */ parseHelmExternalId } from 'ui/utils/parse-externalid';

export default Route.extend({
  catalog: service(),
  store:   service(),

  actions: {
    fetchDeps(apps) {
      this.fetchAppTemplates(apps);
    },
  },
  fetchAppTemplates: function(apps) {
    const catalog = get(this, 'catalog');
    let deps      = [];

    apps.forEach((app) => {
      let extInfo = parseHelmExternalId(app.get('externalId'));
      deps.push(catalog.fetchTemplate(extInfo.templateId, false));
    });

    return all(deps);
  },

  model() {

    return this.get('store').findAll('app').then((apps) => {
      return {
        apps,
      };
    });

  },

  afterModel(model/* , transition */) {
    return this.fetchAppTemplates(get(model, 'apps'));
  }
});
