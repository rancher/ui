import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { get } from '@ember/object';
import { ucFirst } from 'shared/utils/util';

var Catalog = Resource.extend({
  modalService: service('modal'),

  actions: {
    edit() {
      this.get('modalService').toggleModal('modal-edit-catalog', this);
    }
  },

  availableActions: function() {
    const canRemove = !!get(this,'links.remove');

    var choices = [
      { label: 'action.edit',             icon: 'icon icon-edit',         action: 'edit',             enabled: true },
      { divider: true },
      { label: 'action.remove',           icon: 'icon icon-trash',        action: 'promptDelete',     enabled: canRemove, altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',action: 'goToApi',          enabled: true },
    ];

    return choices;
  }.property('links.remove'),


  displayKind: computed('kind', function() {
    return ucFirst(get(this, 'kind') || 'native');
  }),
});

export default Catalog;

Catalog.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

