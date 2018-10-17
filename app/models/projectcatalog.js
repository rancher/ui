import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { ucFirst } from 'shared/utils/util';
import C from 'ui/utils/constants';
import { reference } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  modalService: service('modal'),
  project:      reference('projectId'),


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
      get(this, 'modalService').toggleModal('modal-edit-catalog', {
        model: this,
        scope: 'project'
      });
    },

    clone() {
      const clone = this.cloneForNew();

      get(this, 'modalService').toggleModal('modal-edit-catalog', {
        model: clone,
        scope: 'project'
      });
    }
  },

});
