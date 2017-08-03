import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  access:        Ember.inject.service(),
  'tab-session': Ember.inject.service(),

  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    description:  ['description','name','id'],
    publicValue:  ['publicValue','id'],
    created:      ['created','name','id'],
  },

  application:        Ember.inject.controller(),
  cookies:            Ember.inject.service(),
  projects:           Ember.inject.service(),
  growl:              Ember.inject.service(),
  project:            Ember.computed.alias('projects.current'),
  endpointService:    Ember.inject.service('endpoint'),
  modalService:       Ember.inject.service('modal'),
  bulkActionHandler: Ember.inject.service(),

  headers: [
    {
      name:           'state',
      sort:           ['stateSort','name','id'],
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
        cred = this.get('userStore').createRecord({
          type: 'apikey',
          accountId: this.get(`session.${C.SESSION.ACCOUNT_ID}`),
        });
      }
      else
      {
        cred = this.get('store').createRecord({
          type: 'apikey',
          accountId: this.get('projects.current.id'),
        });
      }

      this.get('modalService').toggleModal('modal-edit-apikey', cred);
    },
  },
});
