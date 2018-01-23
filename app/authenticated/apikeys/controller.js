import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';
import { get, computed } from '@ember/object';

export default Controller.extend({
  access:            service(),
  application:       controller(),
  cookies:           service(),
  scope:             service(),
  growl:             service(),
  project:           alias('scope.currentProject'),
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
      width:          150,
    },
    {
      name:           'description',
      sort:           ['description','name','id'],
      translationKey: 'apiPage.table.description',
    },
    {
      name:           'created',
      sort:           ['created','name','id'],
      translationKey: 'apiPage.table.created',
      width:          200,
    },
    {
      name:           'expires',
      sort:           ['expiresAt','name','id'],
      translationKey: 'apiPage.table.expires.label',
      width:          200,
    },
  ],

  actions: {
    newApikey: function(kind) {
      const cred = this.get('globalStore').createRecord({
        type: 'token',
        ttl: 365*86400*1000,
      });

      this.get('modalService').toggleModal('modal-edit-apikey', cred);
    },
  },

  rows: computed('model.tokens.[]', function() {
    return get(this,'model.tokens').filter((token) => {
      const labels = get(token, 'labels');
      const expired = get(token, 'expired');
      return !expired || !labels || !labels['ui-session'];
    });
  }),
});
