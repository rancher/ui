import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),
  prefs: Ember.inject.service(),

  queryParams: ['sortBy','mode'],
  sortBy: 'name',
  mode: 'list',

  _allStacks: null,
  init() {
    this.set('_allStacks', this.get('store').all('stack'));
  },

  filtered: function() {
    let all = this.get('model');
    if ( this.get('prefs.showSystemResources') ) {
      return all;
    } else {
      return all.filterBy('isSystem', false);
    }
  }.property('model.@each.system','prefs.showSystemResources'),

  simpleMode: function() {
    let list = this.get('_allStacks');
    if ( !this.get('prefs.showSystemResources') ) {
      list = list.filterBy('system', false);
    }

    let bad = list.findBy('isDefault', false);
    return !bad;
  }.property('_allStacks.@each.{state,isDefault}','prefs.showSystemResources'),

  groupBy: function() {
    if ( !this.get('simpleMode') && this.get('mode') === 'grouped' ) {
      return 'stack.id';
    } else {
      return null; 
    }
  }.property('simpleMode', 'mode'),
});
