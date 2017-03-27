import Ember from 'ember';

export default Ember.Controller.extend({
  sortBy: 'name',
  prefs: Ember.inject.service(),

  queryParams: ['sortBy'],

  headers: [
    {
      name: 'stateSort',
      sort: ['stateSort','name','id'],
      type: 'string',
      searchField: 'displayState',
      translationKey: 'generic.state',
      width: 125,
    },
    {
      displayName: 'Name',
      name: 'name',
      sort: ['name','id'],
      translationKey: 'generic.name',
    },
    {
      name: 'description',
      translationKey: 'generic.description',
      sort: ['description','name','id'],
    },
    {
      name: 'created',
      translationKey: 'generic.created',
      sort: ['created:desc','name','id'],
      searchField: false,
      type: 'string',
    },
  ],

  sortableContent: Ember.computed.alias('filtered'),
  filtered: function() {
    let all = this.get('model');
    if ( !this.get('prefs.showSystemResources') ) {
      all = all.filterBy('isSystem', false);
    }

    return all;
  }.property('model.@each.system','prefs.showSystemResources'),

});
