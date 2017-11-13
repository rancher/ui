import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  sortBy: 'name',
  prefs: service(),
  scope: service(),

  queryParams: ['sortBy'],

  headers: [
    {
      name: 'state',
      sort: ['sortState','name','id'],
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

  sortableContent: alias('filtered'),
  filtered: function() {
    let all = this.get('model');
    if ( !this.get('prefs.showSystemResources') ) {
      all = all.filterBy('isSystem', false);
    }

    return all;
  }.property('model.@each.system','prefs.showSystemResources'),

});
