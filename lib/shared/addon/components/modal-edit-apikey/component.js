import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, NewOrEdit, {
  layout,
  endpointService: service('endpoint'),
  scope: service(),

  classNames: ['large-modal', 'alert'],
  originalModel: alias('modalService.modalOpts'),
  model: null,
  clone: null,
  justCreated: false,

  didReceiveAttrs() {
    this.set('clone', this.get('originalModel').clone());
    this.set('model', this.get('originalModel').clone());
    this.set('justCreated', false);
  },

  displayEndpoint: function() {
    return this.get('endpointService.api.display.current');
  }.property(),

  linkEndpoint: function() {
    return this.get('endpointService.api.auth.current');
  }.property(),

  didInsertElement() {
    setTimeout(() => {
      this.$('TEXTAREA')[0].focus();
    }, 250);
  },

  editing: function() {
    return !!this.get('clone.id');
  }.property('clone.id'),

  doneSaving: function(neu) {
    if ( this.get('editing') ) {
      this.send('cancel');
    } else {
      this.setProperties({
        justCreated: true,
        clone: neu.clone()
      });
    }
  },

});
