import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import { tagChoices, tagsToArray } from 'ui/models/stack';
import ModalBase from 'shared/mixins/modal-base';
import { uniqKeys } from 'shared/utils/util';
import layout from './template';

export default Component.extend(ModalBase, NewOrEdit, {
  layout,
  classNames: ['large-modal'],
  originalModel: alias('modalService.modalOpts'),
  editing: true,
  model: null,

  actions: {
    addTag(tag) {
      let neu = tagsToArray(this.get('primaryResource.group'));
      neu.addObject(tag);
      this.set('primaryResource.group', neu.join(', '));
    },
  },

  allStacks: null,
  willInsertElement: function() {
    this._super(...arguments);
    var orig = this.get('originalModel');
    var clone = orig.clone();
    delete clone.services;
    this.set('model', clone);
    this.set('allStacks', this.get('store').all('stack'));
  },

  tagChoices: function() {
    let choices = uniqKeys(tagChoices(this.get('allStacks'))).sort();
    if ( !choices.length ) {
      return null;
    }

    return choices;
  }.property('allStacks.@each.group'),

  doneSaving: function() {
    this.send('cancel');
  }
});
