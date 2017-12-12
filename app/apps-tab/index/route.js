import { on } from '@ember/object/evented';
import EmberObject from '@ember/object';
import { get } from '@ember/object';
import { allSettled } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Route.extend({
  catalog: service(),

  model() {
    const catalog = get(this, 'catalog');

    return this.get('store').findAll('namespace').then((namespaces) => {
      let deps = [];

      namespaces.filterBy('isFromCatalog', true).forEach((stack) => {
        let extInfo = parseExternalId(stack.get('externalId'));
        deps.push(catalog.fetchTemplate(extInfo.templateId, false));
      });

      return allSettled(deps).then(() => {
        return EmberObject.create({
          namespaces,
        });
      });
    });
  },
});
