import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

const HEADERS = [
  {
    name:           'state',
    sort:           ['sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120
  },
  {
    name:           'name',
    sort:           ['displayName'],
    searchField:    'displayName',
    translationKey: 'generic.name',

  },
];

export default Controller.extend({
  growl:        service(),
  settings:     service(),
  globalStore:  service(),
  modalService: service('modal'),
  headers:      HEADERS,

  actions: {
    addNewDriver() {
      let newDriver = this.get('globalStore').createRecord({
        type:        'kontainerDriver',
        name:        null,
        description: null,
        checksum:    null,
        url:         null,
        active:      true,
      });

      this.get('modalService').toggleModal('modal-edit-driver', newDriver);
    },
  },

  rows: computed('model.drivers.@each.{state,id,version,externalId}', function() {
    // possibly add some search here
    let drivers    = this.get('model.drivers.content');

    return drivers;
  }),

});
