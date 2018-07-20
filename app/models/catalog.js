import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { get } from '@ember/object';
import { ucFirst } from 'shared/utils/util';
import C from 'ui/utils/constants';

export default Resource.extend({
  modalService: service('modal'),

  displayKind: computed('kind', function() {
    return ucFirst(get(this, 'kind'));
  }),

  canClone: computed('actions.clone', function() {
    const name         = get(this, 'name');
    const catalogNames = get(C, 'CATALOG');
    const builtIn      = [get(catalogNames, 'LIBRARY_KEY'), get(catalogNames, 'HELM_STABLE_KEY'), get(catalogNames, 'HELM_INCUBATOR_KEY')];

    return !builtIn.includes(name);
  }),

  actions: {
    edit() {
      this.get('modalService').toggleModal('modal-edit-catalog', this);
    },

    clone() {
      const clone = this.cloneForNew();

      this.get('modalService').toggleModal('modal-edit-catalog', clone);
    }
  },

});
