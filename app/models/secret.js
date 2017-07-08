import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  modalService: Ember.inject.service('modal'),
  actions: {
    edit: function() {
      this.get('modalService').toggleModal('modal-edit-secret', this);
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks');
    if ( !a )
    {
      return [];
    }

    var choices = [
      { label: 'action.remove',     icon: 'icon icon-trash',          action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',  action: 'goToApi',      enabled: true },
    ];

    return choices;
  }.property('actionLinks.{remove,update}'),
});
