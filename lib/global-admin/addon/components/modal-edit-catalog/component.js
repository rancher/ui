import { alias, notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { set } from '@ember/object';

const kindChoices = [
  {
    translationKey: 'catalogSettings.more.kind.helm',
    value:          'helm'
  },
];

export default Component.extend(ModalBase, NewOrEdit, {
  layout,
  classNames:    ['medium-modal'],
  model:         null,

  allNamespaces: null,
  allProjects:   null,

  kindChoices,

  originalModel:  alias('modalService.modalOpts'),
  editing:        notEmpty('originalModel.id'),

  init() {
    this._super(...arguments);

    var orig = this.get('originalModel');
    var clone = orig.clone();

    set(clone, 'kind', 'helm');
    set(this, 'model', clone);
  },

  doneSaving() {
    this.send('cancel');
  },

});
