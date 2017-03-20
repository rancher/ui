import Ember from 'ember';

export default Ember.Controller.extend({
  sortBy: 'address',
  headers:  [
    {
      name:           'state',
      sort:           ['stateSort','displayAddress','id'],
      translationKey: 'registriesPage.index.table.header.state',
      width:          125,
    },
    {
      name:           'address',
      sort:           ['displayAddress','id'],
      translationKey: 'registriesPage.index.table.header.address',
    },
    {
      name:           'username',
      sort:           ['credential.publicValue','displayAddress','id'],
      translationKey: 'registriesPage.index.table.header.username',
    },
    {
      name:           'created',
      sort:           ['created','id'],
      translationKey: 'registriesPage.index.table.header.created',
    },
  ],
});
