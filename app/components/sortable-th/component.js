import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'TH',
  classNames: ['sortable'],
  name: null,
  sortable: null,
  width: null,
  label: null,

  displayLabel: function() {
    var label = this.get('label');
    if ( label )
    {
      return label;
    }
    else
    {
      // e.g. publicValue => Public Value
      return (this.get('name')||'').dasherize().split('-').map((str) => { return str.capitalize(); }).join(' ');
    }
  }.property('name','label'),

  current: Ember.computed.alias('sortable.sortBy'),
  descending: Ember.computed.alias('sortable.descending'),

  activeAscending: function() {
    return !this.get('descending') && this.get('current') === this.get('name');
  }.property('name','current','descending'),

  activeDescending: function() {
    return this.get('descending') && this.get('current') === this.get('name');
  }.property('name','current','descending'),

  attributeBindings: ['width'],

  click: function() {
    this.sendAction('action', this.get('name'));
  }
});
