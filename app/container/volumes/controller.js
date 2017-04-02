import Ember from 'ember';

export default Ember.Controller.extend({
  sortBy: 'name',
  queryParams: ['sortBy'],
  searchText: '',

  headers: [
    {
      name: 'name',
      sort: ['volumeName'],
      searchField: 'volumeName',
      translationKey: 'generic.name',
    },
    {
      name: 'path',
      sort: ['path','volumeName'],
      searchField: 'path',
      translationKey: 'containerPage.volumesTab.table.path',
    },
    {
      name: 'writable',
      sort: ['isReadWrite','volumeName'],
      searchField: false,
      translationKey: 'containerPage.volumesTab.table.writable',
    },
  ],
});
