import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';

export default Component.extend(ModalBase, NewOrEdit, {
  endpointService: service('endpoint'),
  scope:           service(),

  layout,
  classNames:    ['large-modal', 'alert'],
  model:         null,
  clone:         null,
  justCreated:   false,
  expire:        'never',

  originalModel:   alias('modalService.modalOpts'),
  didReceiveAttrs() {
    set(this, 'clone', get(this, 'originalModel').clone());
    set(this, 'model', get(this, 'originalModel').clone());
    set(this, 'justCreated', false);
    this.expireChanged();
  },

  didInsertElement() {
    setTimeout(() => {
      this.$('TEXTAREA')[0].focus();
    }, 250);
  },

  expireChanged: observer('expire', function() {
    const now = moment();
    let expire = now.clone();

    if ( get(this, 'expire') ) {
      expire = expire.add(1, get(this, 'expire'));
    }

    set(this, 'model.ttl', expire.diff(now));
  }),

  displayEndpoint: function() {
    return get(this, 'endpointService.api.display.current');
  }.property(),

  linkEndpoint: function() {
    return get(this, 'endpointService.api.auth.current');
  }.property(),

  editing: function() {
    return !!get(this, 'clone.id');
  }.property('clone.id'),

  displayPassword: computed('clone.token', 'clone.name', function() {
    const prefix = get(this, 'clone.name');
    const token = get(this, 'clone.token');

    if ( !token || !prefix ) {
      return null;
    }

    const parts = token.split(':');

    if ( parts.length === 2 && parts[0] === prefix ){
      return parts[1];
    }

    return null;
  }),

  doneSaving(neu) {
    if ( get(this, 'editing') ) {
      this.send('cancel');
    } else {
      setProperties(this, {
        justCreated: true,
        clone:       neu.clone()
      });
    }
  },

});
