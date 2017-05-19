import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Ember.Route.extend({
  catalog: Ember.inject.service(),

  model() {
    return this.get('store').find('stack').then((stacks) => {
      let deps = [];
      let catalog = this.get('catalog');
      stacks = stacks.filterBy('isFromCatalog', true);

      stacks.forEach((stack) => {
        let extInfo = parseExternalId(stack.get('externalId'));
        deps.push(catalog.fetchTemplate(extInfo.templateId, false));
      });
      return Ember.RSVP.all(deps).then((ahray) => {
        ahray.forEach((ary) => {
          let stck = stacks.findBy('externalIdInfo.templateId', ary.id);
          stck.catalogTemplateInfo = ary; // need that generica catalog icon
        });
        return Ember.Object.create({
          stacks: stacks,
        });
      });
    });
  },

  setDefaultRoute: Ember.on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'containers');
  }),
});
