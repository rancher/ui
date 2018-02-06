import EmberObject from '@ember/object';
import { get } from '@ember/object';
import { allSettled } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Route.extend({
  catalog: service(),
  globalStore: service(),

  model() {
    const catalog = get(this, 'catalog');

    return this.get('globalStore').find('app').then((apps) => {
      debugger;
      let deps = [];

      apps.forEach((stack) => {
        let extInfo = parseExternalId(stack.get('externalId'));
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
