import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import {tagChoices, tagsToArray} from 'ui/models/stack';
import ModalBase from 'ui/mixins/modal-base';
import { uniqKeys } from 'ui/utils/util';

export default Ember.Component.extend(ModalBase, NewOrEdit, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
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
