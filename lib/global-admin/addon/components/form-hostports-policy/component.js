import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';


export default Component.extend({
  layout,
  globalStore: service(),


  classNames: ['accordion-wrapper'],

  model: null,

  init() {
    this._super(...arguments);
    this.set('model.hostPorts', this.get('model.hostPorts') || []);
  },

  actions: {
    add: function() {
      this.get('model.hostPorts').pushObject(
        this.get('globalStore').createRecord({
          type: 'hostPortRange',
          min: 6000,
          max: 7000,
        })
      );
    },
    remove: function(obj) {
      this.get('model.hostPorts').removeObject(obj);
    },
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function (item) {
        item.toggleProperty('expanded');
      });
    }
  },

  statusClass: null,
  status: null,
});
