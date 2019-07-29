import {  get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  classNames: ['accordion-wrapper'],

  expandAll:    null,
  expandOnInit: false,

  didReceiveAttrs() {
    if ( !get(this, 'expandFn') ) {
      set(this, 'expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },
});
