import Component from '@ember/component';
import layout from './template';
import { headers } from 'ui/containers/index/controller'
import { set } from '@ember/object';
export default Component.extend({
  layout,
  classNames: ['accordion-wrapper'],

  headers,
  expandedInstances: null,
  expandOnInit:      false,

  init() {
    this._super(...arguments);
    set(this, 'expandedInstances', []);
  },

  actions: {
    toggleExpand(instId) {
      let list = this.get('expandedInstances');

      if ( list.includes(instId) ) {
        list.removeObject(instId);
      } else {
        list.addObject(instId);
      }
    },
  },
});
