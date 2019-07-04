import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  hostRequired: true,
  namespaceId:  null,
  value:        null,
  showLabel:    true,

  hosts:        null,

  init() {
    this._super(...arguments);
    set(this, 'hosts', get(this, 'store').all('service'));
  },

  hostChoices: computed('hosts.@each.name', 'namespaceId', function() {
    return get(this, 'hosts').filter((host) => get(host, 'selector.app')).filterBy('namespaceId', get(this, 'namespaceId'))
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
