import Ember from 'ember';
import FilterState from 'ui/mixins/filter-state';

const showKinds = ['user','admin'];

export default Ember.Controller.extend(FilterState, {
  access: Ember.inject.service(),
  sortBy: 'name',
  headers: [
    {
      translationKey: 'generic.state',
      name: 'state',
      sort: ['state'],
      width: '125px'
    },
    {
      translationKey: 'generic.id',
      name: 'id',
      sort: ['id'],
      width: '120px'
    },
    {
      translationKey: 'accountsPage.index.table.kind',
      name: 'kind',
      sort: ['kind'],
      width: '120px'
    },
    {
      translationKey: 'accountsPage.index.table.username',
      name: 'username',
      sort: ['username'],
    },
    {
      translationKey: 'accountsPage.index.table.identity',
      name: 'name',
      sort: ['name'],
    },
    {
      isActions: true,
      width: '75px',
    },
  ],

  filteredByKind: function() {
    return this.get('filtered').filter((row) => {
      var kind = (row.get('kind')||'').toLowerCase();
      return showKinds.indexOf(kind) !== -1;
    });
  }.property('filtered.@each.kind'),

  isLocal: function() {
    return this.get('access.provider') === 'localauthconfig';
  }.property('access.provider'),
});
