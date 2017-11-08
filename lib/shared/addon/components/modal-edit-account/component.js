import { resolve } from 'rsvp';
import EmberObject, { computed } from '@ember/object';
import { alias, not, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import C from 'ui/utils/constants';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, NewOrEdit, {
  layout,
  classNames:         ['large-modal'],
  access:             service(),
  primaryResource:    alias('model.account'),
  settings:           service(),

  originalModel:      alias('modalService.modalOpts'),
  account:            null,
  credential:         null,

  oldPassword:        '',
  newPassword:        '',
  newPassword2:       '',
  isAdmin:            alias('access.admin'),
  generated:          false,
  needOld:            not('isAdmin'),
  showConfirm:        not('generated'),

  actions: {
    error(err) {
      if ( err.get('code') === 'InvalidOldPassword' )
      {
        this.set('errors',['Current password is incorrect']);
      }
      else
      {
        this._super(err);
      }
    },

    generated() {
      this.set('generated', true);
    },
  },

  validateDescription: computed(function() {
    return this.get('settings').get(C.SETTING.AUTH_LOCAL_VALIDATE_DESC) || null;
  }),

  isLocalAuth: function() {
    return this.get('access.provider') === 'localauthconfig';
  }.property('access.provider'),

  authEnabled: reads('access.enabled'),

  init() {
    this._super(...arguments);
    var accountClone = this.get('originalModel').clone();
    var credential = this.get('originalModel.passwordCredential');
    var credentialClone = (credential ? credential.clone() : null);

    this.set('model', EmberObject.create({
      account: accountClone,
      credential: credentialClone,
    }));
  },

  validate() {
    var errors = [];
    var old = this.get('oldPassword');
    var neu = this.get('newPassword');
    var neu2 = this.get('newPassword2');

    if ( neu || neu2 )
    {
      if ( this.get('needOld') && !old )
      {
        errors.push('Current password is required');
      }

      if ( this.get('showConfirm') && neu !== neu2 )
      {
        errors.push('New passwords do not match');
      }
    }

    if ( errors.length )
    {
      this.set('errors', errors);
      return false;
    }

    return true;
  },

  doSave() {
    // Users can't update the account
    if ( this.get('isAdmin') )
    {
      return this._super();
    }
    else
    {
      return resolve();
    }
  },

  didSave() {
    var old = this.get('oldPassword');
    var neu = this.get('newPassword');

    if ( neu )
    {
      return this.get('model.credential').doAction('changesecret', {
        newSecret: neu,
        oldSecret: old,
      }, {catchGrowl: false});
    }
  },

  doneSaving() {
    this.send('cancel');

    // If you edit yourself and make yourself a user, drop the admin bit.
    if ( this.get('model.account.id') === this.get('session.'+C.SESSION.ACCOUNT_ID) && this.get('model.account.kind') !== 'admin' )
    {
      this.set('access.admin', false);
      this.set('session.'+C.SESSION.USER_TYPE, this.get('model.account.kind'));
    }

    return resolve();
  },

});
