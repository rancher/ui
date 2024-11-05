import Resource from 'ember-api-store/models/resource';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';

var KontainerDriver = Resource.extend({
  intl:         service(),
  modalService: service('modal'),
  type:         'kontainerDriver',

  availableActions: computed('actionLinks.{activate,deactivate}', function() {
    let a = this.actionLinks || {};

    return [
      {
        label:    'action.activate',
        icon:     'icon icon-play',
        action:   'activate',
        enabled:  !!a.activate,
        bulkable: true
      },
      {
        label:     'action.deactivate',
        icon:      'icon icon-pause',
        action:    'promptDeactivate',
        enabled:   !!a.deactivate,
        bulkable:  true,
        altAction: 'deactivate',
      },
    ];
  }),

  displayName: computed('id', 'intl.locale', 'name', function() {
    const intl = this.intl;
    const name = this.name;
    const keyByName = `kontainerDriver.displayName.${ name }`;
    const keyById = `kontainerDriver.displayName.${ this.id }`;

    if ( name && intl.exists(keyByName) ) {
      return intl.t(keyByName);
    } if ( intl.exists(keyById) ) {
      return intl.t(keyById);
    } else if ( name ) {
      return name.capitalize();
    } else {
      return `(${  this.id  })`;
    }
  }),

  canEdit: computed('links.update', 'builtin', function() {
    return !!get(this, 'links.update') && !this.builtin;
  }),


  hasUi: computed('hasBuiltinUi', 'uiUrl', function() {
    return !!this.uiUrl;
  }),


  actions: {
    activate() {
      return this.doAction('activate');
    },

    deactivate() {
      return this.doAction('deactivate');
    },

    edit() {
      this.modalService.toggleModal('modal-edit-driver', this);
    },

    promptDeactivate() {
      this.modalService.toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action:        'deactivate'
      });
    },
  },

});

export default KontainerDriver;
