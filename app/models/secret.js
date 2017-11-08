import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  modalService: service('modal'),
  actions: {
    edit: function() {
      this.get('modalService').toggleModal('modal-edit-secret', this);
    },
  },

  availableActions: function() {
    var l = this.get('links');

    var choices = [
      { label: 'action.remove',     icon: 'icon icon-trash',          action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',  action: 'goToApi',      enabled: true },
    ];

    return choices;
  }.property('l.{remove}'),
});
