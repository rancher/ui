import Controller from '@ember/controller';
import { computed, get } from '@ember/object';

const HEADERS = [
  {
    translationKey: 'generic.state',
    name:           'state',
    width:          100,
  },
  {
    translationKey: 'globalDnsPage.entriesPage.table.fqdn',
    name:           'fqdn',
    sort:           ['fqdn', 'name', 'id'],
  },
  {
    translationKey: 'globalDnsPage.entriesPage.table.provider',
    name:           'providerName',
    sort:           ['providerName', 'name', 'id'],
    width:          150,
  },
  {
    translationKey: 'globalDnsPage.entriesPage.table.target',
    name:           'target',
    sort:           ['target', 'name', 'id'],
  },
  {
    translationKey: 'generic.created',
    name:           'created',
    searchField:    false,
    sort:           ['created'],
    width:          150,
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
