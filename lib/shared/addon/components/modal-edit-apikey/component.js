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

  isEnvironment: function() {
    return this.get('model.accountId') === this.get('scope.current.id');
  }.property('model.accountId','scope.current.id'),

  displayEndpoint: function() {
    if ( this.get('isEnvironment') ) {
      return this.get('endpointService.api.display.environment.current');
    } else {
      return this.get('endpointService.api.display.account.current');
    }
  }.property('isEnvironment'),

  linkEndpoint: function() {
    if ( this.get('isEnvironment') ) {
      return this.get('endpointService.api.auth.environment.current');
    } else {
      return this.get('endpointService.api.auth.account.current');
    }
  }.property('isEnvironment'),

  didInsertElement() {
    setTimeout(() => {
      this.$('INPUT[type="text"]')[0].focus();
    }, 250);
  },

  editing: function() {
    return !!this.get('clone.id');
  }.property('clone.id'),

  doneSaving: function(neu) {
    if ( this.get('editing') )
    {
      this.send('cancel');
    }
    else
    {
      this.setProperties({
        justCreated: true,
        clone: neu.clone()
      });
    }
  },

});
