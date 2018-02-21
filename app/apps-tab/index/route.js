import EmberObject from '@ember/object';
import { get } from '@ember/object';
import { allSettled } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { /* parseExternalId, */ parseHelmExternalId } from 'ui/utils/parse-externalid';

export default Route.extend({
  catalog: service(),
  store: service(),

  model() {
    const catalog = get(this, 'catalog');

    return this.get('store').find('app').then((apps) => {
      let deps = [];

      apps.forEach((app) => {
        let extInfo = parseHelmExternalId(app.get('externalId'));
        deps.push(catalog.fetchTemplate(extInfo.templateId, false));
      });

      return allSettled(deps).then(() => {
        return EmberObject.create({
          apps,
        });
      });
    });
  },
});
