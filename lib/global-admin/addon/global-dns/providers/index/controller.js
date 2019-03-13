import Controller from '@ember/controller';
import { computed, get } from '@ember/object';

const HEADERS = [
  {
    translationKey: 'generic.state',
    name:           'state',
    width:          100,
  },
  {
    translationKey: 'globalDnsPage.providersPage.table.name',
    name:           'name',
    sort:           ['name', 'id'],
  },
  {
    translationKey: 'globalDnsPage.providersPage.table.rootDomain',
    name:           'rootDomain',
    sort:           ['rootDomain', 'name', 'id'],
  },
  {
    translationKey: 'generic.created',
    name:           'created',
    sort:           ['created'],
    searchField:    false,
    classNames:     'pr-20',
    width:          200,
  },
];

export default Controller.extend({
  sortBy:       'name',
  searchText:   '',
  headers:      HEADERS,

  rows: computed('model.[]', function() {
    return get(this, 'model');
  })
});
