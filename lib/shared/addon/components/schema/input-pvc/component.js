import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,
  classNames: ['form-control'],

  namespaceId: null,
  fiedl:       null,
  value:       null,

  pvcs:        null,

  init() {
    this._super(...arguments);
    set(this, 'pvcs', get(this, 'store').all('persistentVolumeClaim'));
  },

  pvcChoices: computed('pvcs.@each.{name,state}', 'namespaceId', function() {
    return get(this, 'pvcs').filterBy('namespaceId', get(this, 'namespaceId'))
      .map((v) => {
        let label = get(v, 'displayName');
        const state = get(v, 'state');
        const disabled = false;

        if ( disabled ) {
          label += ` (${  state  })`;
        }

        return {
          label,
          disabled,
          value: get(v, 'name'),
        }
      })
      .sortBy('label');
  }),
});
