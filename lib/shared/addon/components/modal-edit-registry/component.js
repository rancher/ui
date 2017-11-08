import EmberObject from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, NewOrEdit, {
  layout,
  classNames: ['large-modal'],
  originalModel: alias('modalService.modalOpts'),
  error: null,
  credentials: null,
  model: null,
  editing: true,
  primaryResource: null,

  init: function() {
    this._super(...arguments);
    var orig = this.get('originalModel');

    this.set('model',EmberObject.create({
      allRegistries: orig.get('registries'),
      registry: orig.get('registry').clone(),
      credential: orig.get('credential').clone()
    }));

    this.setProperties({
      'primaryResource': this.get('model.credential'),
      'activeDriver': 'custom',
      'editing': true
    });
  },

  doneSaving: function() {
    this.send('cancel');
  },
});
