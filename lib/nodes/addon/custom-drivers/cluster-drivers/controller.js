import { set, get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { downloadFile } from 'shared/utils/download-files';

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

  refreshing: false,

  actions: {
    addNewDriver() {
      let newDriver = get(this, 'globalStore').createRecord({
        type:        'kontainerDriver',
        name:        null,
        description: null,
        checksum:    null,
        url:         null,
        active:      true,
      });

      this.get('modalService').toggleModal('modal-edit-driver', newDriver);
    },

    refreshMetadata() {
      set(this, 'refreshing', true)
      get(this, 'globalStore').rawRequest({
        url:    '/v3/kontainerdrivers?action=refresh',
        method: 'POST',
      }).catch((error) => {
        get(this, 'growl').fromError(error.message);
      }).finally(() => set(this, 'refreshing', false));
    },

    downloadRancherImages() {
      get(this, 'globalStore').rawRequest({
        url:    '/v3/kontainerdrivers/rancher-images',
        method: 'GET',
      }).then((res) => {
        downloadFile(`.rancher-images.txt`, get(res, 'body'));
      }).catch((error) => {
        get(this, 'growl').fromError('Error downloading image list', error.message);
      });
    },
  },

  rows: computed('model.drivers.@each.{state,id,version,externalId}', function() {
    // possibly add some search here
    let drivers    = get(this, 'model.drivers.content');

    return drivers;
  }),

});
