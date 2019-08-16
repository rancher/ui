import Resource from '@rancher/ember-api-store/models/resource';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';

var KontainerDriver = Resource.extend({
  intl:         service(),
  modalService: service('modal'),
  type:         'kontainerDriver',

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
        label:     'action.deactivate',
        icon:      'icon icon-pause',
        action:    'promotDeactivate',
        enabled:   !!a.deactivate,
        bulkable:  true,
        altAction: 'deactivate',
      },
    ];
  }),

  displayName: computed('name', 'intl.locale', function() {
    const intl = get(this, 'intl');
    const name = get(this, 'name');
    const keyByName = `kontainerDriver.displayName.${ name }`;
    const keyById = `kontainerDriver.displayName.${ get(this, 'id') }`;

    if ( name && intl.exists(keyByName) ) {
      return intl.t(keyByName);
    } if ( intl.exists(keyById) ) {
      return intl.t(keyById);
    } else if ( name ) {
      return name.capitalize();
    } else {
      return `(${  get(this, 'id')  })`;
    }
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

    promotDeactivate() {
      get(this, 'modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action:        'deactivate'
      });
    },
  },

});

export default KontainerDriver;
