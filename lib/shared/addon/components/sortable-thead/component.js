import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'TH',
  classNames: ['sortable'],
  classNameBindings: ['header.classNames'],
  ariaRole: ['columnheader'],
  attributeBindings: ['width'],

  sortable: null,
  header: null,

  current: Ember.computed.alias('sortable.sortBy'),
  descending: Ember.computed.alias('sortable.descending'),

  activeAscending: Ember.computed('header.name','current','descending', function() {
    return !this.get('descending') && this.get('current') === this.get('header.name');
  }),

  activeDescending: Ember.computed('header.name','current','descending', function() {
    return this.get('descending') && this.get('current') === this.get('header.name');
  }),

  click: function() {
    if ( this.get('header.sort') ) {
      this.sendAction('action', this.get('header.name'));
    }
  }
});
