import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, NewOrEdit, {
  endpointService: Ember.inject.service('endpoint'),
  projects: Ember.inject.service(),

  classNames: ['large-modal', 'alert'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  model: null,
  clone: null,
  justCreated: false,

  didReceiveAttrs() {
    this.set('clone', this.get('originalModel').clone());
    this.set('model', this.get('originalModel').clone());
    this.set('justCreated', false);
  },

  isEnvironment: function() {
    return this.get('model.accountId') === this.get('projects.current.id');
  }.property('model.accountId','projects.current.id'),

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
