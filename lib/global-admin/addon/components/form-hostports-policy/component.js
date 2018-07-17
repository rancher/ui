import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';


export default Component.extend({
  globalStore: service(),


  layout,
  classNames: ['accordion-wrapper'],

  model:    null,
  readOnly: false,

  statusClass: null,
  status:      null,
  init() {
    this._super(...arguments);
    this.set('model.hostPorts', this.get('model.hostPorts') || []);
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  actions: {
    add() {
      this.get('model.hostPorts').pushObject(
        this.get('globalStore').createRecord({
          type: 'hostPortRange',
          min:  6000,
          max:  7000,
        })
      );
    },
    remove(obj) {
      this.get('model.hostPorts').removeObject(obj);
    },
  },

});
