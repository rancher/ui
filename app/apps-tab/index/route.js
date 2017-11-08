import { on } from '@ember/object/evented';
import EmberObject from '@ember/object';
import { allSettled } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Route.extend({
  catalog: service(),

  model() {
    return this.get('store').findAll('stack').then((stacks) => {
      let deps = [];
      let catalog = this.get('catalog');
      stacks = stacks.filterBy('isFromCatalog', true);

      stacks.forEach((stack) => {
        let extInfo = parseExternalId(stack.get('externalId'));
        deps.push(catalog.fetchTemplate(extInfo.templateId, false));
      });

      return allSettled(deps).then(() => {
        return EmberObject.create({
          stacks: stacks,
        });
      });
    });
  },

  setDefaultRoute: on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'containers');
  }),
});
