import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import moment from 'moment';
import $ from 'jquery';

export default Component.extend(ModalBase, NewOrEdit, {
  endpointService: service('endpoint'),
  scope:           service(),

  layout,
  classNames:      ['large-modal', 'alert'],
  model:           null,
  clone:           null,
  justCreated:     false,
  expire:          'never',

  originalModel:   alias('modalService.modalOpts'),
  displayEndpoint: alias('endpointService.api.display.current'),
  linkEndpoint:    alias('endpointService.api.auth.current'),

  didReceiveAttrs() {
    setProperties(this, {
      clone:       get(this, 'originalModel').clone(),
      model:       get(this, 'originalModel').clone(),
      justCreated: false,
    });

    this.expireChanged();
  },

  didInsertElement() {
    setTimeout(() => {
      $('TEXTAREA')[0].focus();
    }, 250);
  },

  expireChanged: observer('expire', function() {
    const now  = moment();
    let expire = now.clone();

    if ( get(this, 'expire') ) {
      expire = expire.add(1, get(this, 'expire'));
    }

    set(this, 'model.ttl', expire.diff(now));
  }),

  editing: computed('clone.id', function() {
    return !!get(this, 'clone.id');
  }),

  displayPassword: computed('clone.token', 'clone.name', function() {
    const prefix = get(this, 'clone.name');
    const token  = get(this, 'clone.token');

    if ( !token || !prefix ) {
      return null;
    }

    const parts = token.split(':');

    if ( parts.length === 2 && parts[0] === prefix ){
      return parts[1];
    }

    return null;
  }),

  allClusters: computed('scope.allClusters.@each.{id}', function() {
    const allClusters = get(this, 'scope.allClusters');

    return allClusters.map((c) => {
      return {
        label: `${ get(c, 'displayName') } ( ${ get(c, 'id') } )`,
        value: get(c, 'id'),
      }
    }).sortBy('displayName');
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
