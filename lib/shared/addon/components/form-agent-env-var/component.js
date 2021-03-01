import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  globalStore: service(),
  intl:        service(),
  layout,

  model:    null,
  editable: true,
  editing:  true,
  value:    [],
  init() {
    this._super(...arguments);

    this.set('value', this.value || []);
  },

  actions: {
    add() {
      this.value.pushObject({});
    },
    remove(index) {
      this.value.removeAt(index, 1);
    },
  },
});
