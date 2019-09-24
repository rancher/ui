import Resource from '@rancher/ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { ucFirst } from 'shared/utils/util';
import C from 'ui/utils/constants';

const Catalog = Resource.extend({
  modalService: service('modal'),
  level:        'global',

  displayKind: computed('kind', function() {
    return ucFirst(get(this, 'kind'));
  }),

  combinedState: computed('id', function() {
    if ( !get(this, 'id') ) {
      return 'disabled';
    }
  }),

  canClone: computed('actions.clone', function() {
    const name         = get(this, 'name');
    const catalogNames = get(C, 'CATALOG');
    const builtIn      = [get(catalogNames, 'LIBRARY_KEY'), get(catalogNames, 'ALIBABA_APP_HUB_KEY'), get(catalogNames, 'HELM_STABLE_KEY'), get(catalogNames, 'HELM_INCUBATOR_KEY')];

    return !builtIn.includes(name);
  }),

  availableActions: computed('actionLinks.{refresh}', function() {
    let a = get(this, 'actionLinks') || {};

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
      this.save();
    },

    edit() {
      get(this, 'modalService').toggleModal('modal-edit-catalog', {
        model: this,
        scope: get(this, 'level')
      });
    },

    clone() {
      const clone = this.cloneForNew();

      get(this, 'modalService').toggleModal('modal-edit-catalog', {
        model: clone,
        scope: get(this, 'level')
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
