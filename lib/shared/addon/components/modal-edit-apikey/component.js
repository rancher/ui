import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set, computed, setProperties } from '@ember/object';

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
    set(this,'clone', get(this,'originalModel').clone());
    set(this,'model', get(this,'originalModel').clone());
    set(this,'justCreated', false);
  },

  displayEndpoint: function() {
    return get(this,'endpointService.api.display.current');
  }.property(),

  linkEndpoint: function() {
    return get(this,'endpointService.api.auth.current');
  }.property(),

  didInsertElement() {
    setTimeout(() => {
      this.$('TEXTAREA')[0].focus();
    }, 250);
  },

  editing: function() {
    return !!get(this,'clone.id');
  }.property('clone.id'),

  displayPassword: computed('clone.token','clone.name', function() {
    const prefix = get(this, 'clone.name');
    const token = get(this, 'clone.token');
    if ( !token || ! prefix ) {
      return null;
    }

    const parts = token.split(':');
    if ( parts.length === 2 && parts[0] === prefix ){
      return parts[1];
    }

    return null;
  }),

  doneSaving: function(neu) {
    if ( get(this,'editing') ) {
      this.send('cancel');
    } else {
      setProperties(this, {
        justCreated: true,
        clone: neu.clone()
      });
    }
  },

});
