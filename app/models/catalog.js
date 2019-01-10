import Resource from '@rancher/ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { ucFirst } from 'shared/utils/util';
import C from 'ui/utils/constants';

export default Resource.extend({
  modalService: service('modal'),
  level:        'global',

  displayKind: computed('kind', function() {
    return ucFirst(get(this, 'kind'));
  }),

  canClone: computed('actions.clone', function() {
    const name         = get(this, 'name');
    const catalogNames = get(C, 'CATALOG');
    const builtIn      = [get(catalogNames, 'LIBRARY_KEY'), get(catalogNames, 'HELM_STABLE_KEY'), get(catalogNames, 'HELM_INCUBATOR_KEY')];

    return !builtIn.includes(name);
  }),

  availableActions: computed('actionLinks.{refresh}', function() {
    let a = get(this, 'actionLinks') || {};

    return [{
      enabled: !!a.refresh,
      label:   'catalogPage.index.refreshBtn',
      icon:    'icon icon-refresh',
      action:  'refresh'
    }];
  }),

  actions: {
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
