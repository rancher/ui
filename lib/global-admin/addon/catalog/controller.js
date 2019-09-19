import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get } from '@ember/object';

export default Controller.extend({
  globalStore:  service(),
  modalService: service('modal'),
  growl:        service(),
  settings:     service(),
  catalog:      service(),

  togglingHelmIncubator: false,
  togglingHelmStable:    false,
  togglingLibrary:       false,

  actions: {
    add() {
      const record = get(this, 'globalStore').createRecord({
        type:   'catalog',
        kind:   'helm',
        branch: 'master',
      });

      get(this, 'modalService').toggleModal('modal-edit-catalog', {
        model: record,
        scope: 'global'
      });
    },
  },
});
