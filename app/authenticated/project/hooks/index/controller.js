import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  settings: service(),
  scope: service(),

  sortBy:'name',

  headers: [
    {
      translationKey: 'generic.state',
      name: 'state',
      sort: ['sortState','name','id'],
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
    },
    {
      translationKey: 'hookPage.fields.url.label',
      width: '100'
    },
  ],

});
