import { observer, set, get } from '@ember/object';
import { on } from '@ember/object/evented';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { inject as service } from '@ember/service';

export default Component.extend(ModalBase, NewOrEdit, {
  scope:  service(),

  layout,
  classNames:    ['large-modal'],
  model:         null,
  editing:       true,

  requireAny:     null,
  customName:     null,

  originalModel:      alias('modalService.modalOpts'),
  taintCapabilites:   alias('scope.currentCluster.capabilities.taintSupport'),

  init() {
    this._super(...arguments);
    set(this, 'model', get(this, 'originalModel').clone());

    if (get(this, 'model.name')) {
      set(this, 'customName', get(this, 'model.name'))
    }
  },

  customNameObserver: on('init', observer('customName', function() {
    let cn = get(this, 'customName');

    if (cn && cn.length > 0) {
      set(this, 'primaryResource.name', cn);
    } else {
      set(this, 'primaryResource.name', null);
    }
  })),

  doneSaving() {
    this.send('cancel');
  },
});
