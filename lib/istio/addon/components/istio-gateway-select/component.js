import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  namespaceId:  null,
  value:        null,
  showLabel:    true,

  gateways:     null,

  init() {
    this._super(...arguments);
    set(this, 'gateways', get(this, 'store').all('gateway'));
  },

  gatewayChoices: computed('gateways.@each.name', 'namespaceId', function() {
    return get(this, 'gateways').filterBy('namespaceId', get(this, 'namespaceId'))
      .map((v) => {
        const name = get(v, 'name');

        return {
          label: name,
          value: name,
        }
      })
      .sortBy('label');
  }),
});
