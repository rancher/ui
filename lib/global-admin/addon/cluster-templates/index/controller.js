import Controller from '@ember/controller';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  modalService: service('modal'),

  selection:             [],
  canCompare:            false,

  actions: {
    selectionChanged(s) {
      set(this, 'selection', s || []);
      set(this, 'canCompare', s.length === 2);
    },

    showDiff() {
      const compare = get(this, 'selection');

      this.get('modalService').toggleModal('modal-view-template-diff', compare);
    }
  },
});
