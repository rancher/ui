import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import { tagChoices } from 'ui/models/namespace';
import ModalBase from 'shared/mixins/modal-base';
import { uniqKeys } from 'shared/utils/util';
import layout from './template';
import { inject as service } from '@ember/service';

export default Component.extend(ModalBase, NewOrEdit, {
  scope: service(),

  layout,
  classNames: ['large-modal'],
  originalModel: alias('modalService.modalOpts'),
  editing: true,
  model: null,

  allNamespaces: null,
  allProjects: null,

  init() {
    this._super(...arguments);

    var orig = this.get('originalModel');
    var clone = orig.clone();
    delete clone.services;
    this.set('model', clone);

    this.set('allNamespaces', this.get('clusterStore').all('namespace'));
    this.set('allProjects', this.get('globalStore').all('project').filterBy('clusterId', this.get('scope.currentCluster.id')));
  },

  actions: {
    addTag(tag) {
      let neu = this.get('primaryResource.tags')||[];
      neu.addObject(tag);
      this.set('primaryResource.tags', neu);
    },
  },

  tagChoices: function() {
    let choices = uniqKeys(tagChoices(this.get('allNamespaces'))).sort();
    if ( !choices.length ) {
      return null;
    }

    return choices;
  }.property('allNamespaces.@each.group'),

  doneSaving: function() {
    this.send('cancel');
  }
});
