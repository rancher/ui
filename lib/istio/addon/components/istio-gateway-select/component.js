import Component from '@ember/component';
import { set, computed } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  namespaceId:  null,
  value:        null,
  showLabel:    true,

  gateways:     null,

  init() {
    this._super(...arguments);
    set(this, 'gateways', this.store.all('gateway'));
  },

  gatewayChoices: computed('gateways.@each.name', 'namespaceId', function() {
    return this.gateways.filterBy('namespaceId', this.namespaceId)
      .map((v) => {
        const name = v.name;

        return {
          label: name,
          value: name,
        }
      })
      .sortBy('label');
  }),
});
