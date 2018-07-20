import { alias, notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { computed, get, set } from '@ember/object';
import { later } from '@ember/runloop';

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

  branchDisabled: computed('primaryResource.url', function() {
    const url = get(this, 'primaryResource.url') || '';
    const shouldDisable = url.includes('.git') ? false : true;

    if (shouldDisable) {
      later(() => {
        set(this, 'primaryResource.branch', null);
      });
    }

    return shouldDisable;
  }),
  doneSaving() {
    this.send('cancel');
  },

});
