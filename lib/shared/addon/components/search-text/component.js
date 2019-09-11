import Component from '@ember/component';
import { set } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,
  searchFields: ['displayName', 'id:prefix', 'displayState'],

  actions: {
    clearSearch() {
      set(this, 'searchText', '');
    },
  },
});
