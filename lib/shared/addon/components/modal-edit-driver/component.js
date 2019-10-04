import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import { computed, get, set, setProperties } from '@ember/object';
import layout from './template';
import $ from 'jquery';

export default Component.extend(ModalBase, NewOrEdit, {
  settings: service(),

  layout,
  classNames:      ['large-modal', 'alert'],
  clone:           null,
  errors:          null,

  originalModel:   alias('modalService.modalOpts'),
  primaryResource: alias('originalModel'),

  init() {
    this._super(...arguments);

    const clone = get(this, 'originalModel').clone();

    setProperties(this, {
      clone,
      model: clone,
    })

    scheduleOnce('afterRender', () => {
      $('INPUT')[0].focus();
    });
  },

  actions: {
    updateWhitelist(list) {
      set(this, 'primaryResource.whitelistDomains', list);
    },
  },

  driverType: computed('model.type', function() {
    return get(this, 'model.type') === 'nodeDriver' ? 'Node' : 'Cluster'
  }),

  editing: computed('clone.id', function() {
    return !!get(this, 'clone.id');
  }),

  doneSaving() {
    this.send('cancel');
  }
});
