import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';

export default Controller.extend({
  access:            service(),
  application:       controller(),
  cookies:           service(),
  scope:             service(),
  growl:             service(),
  project:           alias('scope.current'),
  endpointService:   service('endpoint'),
  modalService:      service('modal'),
  bulkActionHandler: service(),

  sortBy:            'name',
  headers: [
    {
      name:           'state',
      sort:           ['sortState','name','id'],
      translationKey: 'apiPage.table.state',
      width:          125,
    },
    {
      name:           'name',
      sort:           ['name','id'],
      translationKey: 'apiPage.table.name',
    },
    {
      name:           'description',
      sort:           ['description','name','id'],
      translationKey: 'apiPage.table.description',
    },
    {
      name:           'publicValue',
      sort:           ['publicValue','id'],
      translationKey: 'apiPage.table.publicValue',
    },
    {
      name:           'created',
      sort:           ['created','name','id'],
      translationKey: 'apiPage.table.created',
      width:          150,
    },
  ],

  filtered: function() {
    var me = this.get(`session.${C.SESSION.ACCOUNT_ID}`);
    return this.get('model.account').filter((row) => {
      return row.get('accountId') === me;
    });
  }.property('model.account.@each.accountId'),

  actions: {
    applyBulkAction(name, selectedElements) {
      this.get('bulkActionHandler')[name](selectedElements);
    },

    newApikey: function(kind) {
      var cred;
      if ( kind === 'account' )
      {
        cred = this.get('globalStore').createRecord({
          type: 'apikey',
          accountId: this.get(`session.${C.SESSION.ACCOUNT_ID}`),
        });
      }
      else
      {
        cred = this.get('store').createRecord({
          type: 'apikey',
          accountId: this.get('scope.current.id'),
        });
      }

      this.get('modalService').toggleModal('modal-edit-apikey', cred);
    },
  },
});
