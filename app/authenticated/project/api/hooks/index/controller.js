import Ember from 'ember';

export default Ember.Controller.extend({
  settings:        Ember.inject.service(),
  sortBy:          'name',

  headers: [
    {
      translationKey: 'generic.state',
      name: 'state',
      sort: ['stateSort','name','id'],
      width: '121'
    },
    {
      translationKey: 'generic.name',
      name: 'name',
      sort: ['name','id'],
    },
    {
      translationKey: 'hookPage.fields.kind.label',
      name: 'kind',
      sort: ['displayKind','id'],
    },
    {
      translationKey: 'hookPage.fields.detail.label',
      noSort: true,
    },
    {
      translationKey: 'hookPage.fields.url.label',
      noSort: true,
      width: '100'
    },
    {
      noSort: true,
      width: '75'
    },
  ],

});
