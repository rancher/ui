import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName:           'TH',
  classNames:        ['sortable'],
  classNameBindings: ['header.classNames'],
  ariaRole:          ['columnheader'],
  attributeBindings: ['width'],

  sortable: null,
  header:   null,

  current:    alias('sortable.sortBy'),
  descending: alias('sortable.descending'),

  activeAscending: computed('header.name', 'current', 'descending', function() {
    return !this.get('descending') && this.get('current') === this.get('header.name');
  }),

  activeDescending: computed('header.name', 'current', 'descending', function() {
    return this.get('descending') && this.get('current') === this.get('header.name');
  }),

  click() {
    if ( this.get('header.sort') ) {
      if (this.action) {
        this.action(this.header.name);
      }
    }
  }
});
