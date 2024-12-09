import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';
import { ucFirst } from 'shared/utils/util';
import C from 'ui/utils/constants';
import { isEmpty } from '@ember/utils';

const {
  HELM_VERSION_2:       helmV2,
  HELM_VERSION_3:       helmV3,
  HELM_VERSION_3_SHORT: helmV3Short,
  HELM_3_LIBRARY_VALUE: helm3LibraryId
} = C.CATALOG;

const Catalog = Resource.extend({
  modalService: service('modal'),
  level:        'global',

  isHelm3: computed('helmVersion', function() {
    const { helmVersion = helmV2 } = this;

    if (helmVersion === helmV3 || helmVersion === helmV3Short) {
      return true;
    }

    return false;
  }),

  displayKind: computed('kind', function() {
    return ucFirst(this.kind);
  }),

  combinedState: computed('id', function() {
    if ( !this.id ) {
      return 'disabled';
    }

    return '';
  }),

  canClone: computed('actions.clone', 'name', function() {
    const name         = this.name;
    const catalogNames = get(C, 'CATALOG');
    const builtIn      = [
      get(catalogNames, 'ALIBABA_APP_HUB_KEY'),
      get(catalogNames, 'HELM_3_LIBRARY_KEY'),
      get(catalogNames, 'HELM_INCUBATOR_KEY'),
      get(catalogNames, 'HELM_STABLE_KEY'),
      get(catalogNames, 'LIBRARY_KEY'),
      get(catalogNames, 'SYSTEM_LIBRARY_KEY'),
    ];

    return !builtIn.includes(name);
  }),

  availableActions: computed('actionLinks.refresh', 'id', function() {
    let a = this.actionLinks || {};

    return [
      {
        action:  'enable',
        icon:    'icon icon-plus-circle',
        enabled: !this.id,
        label:   'generic.enable',
      },
      {
        enabled: !!a.refresh,
        label:   'catalogPage.index.refreshBtn',
        icon:    'icon icon-refresh',
        action:  'refresh'
      }
    ];
  }),

  actions: {
    enable() {
      if (isEmpty(this.id) && !isEmpty(this.url) && this.url === helm3LibraryId) {
        set(this, 'helmVersion', helmV3);
      }

      this.save();
    },

    edit() {
      this.modalService.toggleModal('modal-edit-catalog', {
        model: this,
        scope: this.level
      });
    },

    clone() {
      const clone = this.cloneForNew();

      this.modalService.toggleModal('modal-edit-catalog', {
        model: clone,
        scope: this.level
      });
    },

    refresh() {
      this.doAction('refresh')
    },
  },
});

Catalog.reopenClass({
  stateMap: {
    'disabled': {
      icon:  'icon icon-alert',
      color: 'text-muted'
    }
  }
});

export default Catalog;
