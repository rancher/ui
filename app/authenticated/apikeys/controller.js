import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { get, computed } from '@ember/object';

export default Controller.extend({
  access:            service(),
  cookies:           service(),
  scope:             service(),
  growl:             service(),
  endpointService:   service('endpoint'),
  modalService:      service('modal'),
  bulkActionHandler: service(),
  application:       controller(),

  expire:            'never',
  sortBy:            'name',

  headers: [
    {
      name:           'state',
      sort:           ['sortState', 'name', 'id'],
      translationKey: 'apiPage.table.state',
      width:          80,
    },
    {
      name:           'name',
      sort:           ['name', 'id'],
      translationKey: 'apiPage.table.name',
    },
    {
      name:           'description',
      sort:           ['description', 'name', 'id'],
      translationKey: 'apiPage.table.description',
    },
    {
      name:           'scope',
      sort:           ['scope', 'name', 'id'],
      translationKey: 'apiPage.table.scope',
    },
    {
      name:           'expires',
      sort:           ['expiresAt', 'name', 'id'],
      translationKey: 'apiPage.table.expires.label',
      width:          175,
    },
    {
      classNames:     'text-right pr-20',
      name:           'created',
      sort:           ['created', 'name', 'id'],
      searchField:    false,
      translationKey: 'apiPage.table.created',
      width:          175,
    },
  ],

  project:     alias('scope.currentProject'),
  actions: {
    newApikey() {
      const cred = this.get('globalStore').createRecord({ type: 'token', });

      this.get('modalService').toggleModal('modal-edit-apikey', cred);
    },
  },

  rows:    computed('model.tokens.[]', function() {
    return get(this, 'model.tokens').filter((token) => {
      const labels  = get(token, 'labels');
      const expired = get(token, 'expired');
      const current = get(token, 'current');

      return  ( !expired || !labels || !labels['ui-session'] ) && !current;
    });
  }),
});
