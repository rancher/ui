import Resource from 'ember-api-store/models/resource';
import { computed, get } from '@ember/object';

var KontainerDriver = Resource.extend({
  type:                'kontainerDriver',

  availableActions: computed('actionLinks.{activate,deactivate}', function() {
    let a = get(this, 'actionLinks') || {};

    return [
      {
        label:    'action.activate',
        icon:     'icon icon-play',
        action:   'activate',
        enabled:  !!a.activate,
        bulkable: true
      },
      {
        label:    'action.deactivate',
        icon:     'icon icon-pause',
        action:   'deactivate',
        enabled:  !!a.deactivate,
        bulkable: true
      },
    ];
  }),

  canEdit: computed('links.update', 'builtin', function() {
    return !!get(this, 'links.update') && !get(this, 'builtin');
  }),


  hasUi: computed('hasBuiltinUi', function() {
    return !!get(this, 'uiUrl');
  }),


  actions: {
    activate() {
      return this.doAction('activate');
    },

    deactivate() {
      return this.doAction('deactivate');
    },

    edit() {
      get(this, 'modalService').toggleModal('modal-edit-driver', this);
    },
  },

});

export default KontainerDriver;
