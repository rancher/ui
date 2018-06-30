import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { get } from '@ember/object';
import { ucFirst } from 'shared/utils/util';

export default Resource.extend({
  displayKind: computed('kind', function() {

    return ucFirst(get(this, 'kind'));

  }),
  modalService: service('modal'),

  actions: {
    edit() {

      this.get('modalService').toggleModal('modal-edit-catalog', this);

    }
  },

});
