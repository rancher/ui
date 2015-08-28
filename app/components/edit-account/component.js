import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';

export default Ember.Component.extend(NewOrEdit,{
  access: Ember.inject.service(),
  primaryResource: Ember.computed.alias('model.account'),

  originalModel: null,
  account: null,
  credential: null,

  oldPassword: '',
  newPassword: '',
  newPassword2: '',

  accountTypeChoices: [
    {label: 'User', value: 'user'},
    {label: 'Admin', value: 'admin'},
  ],

  isAdmin: Ember.computed.alias('access.admin'),
  generated: false,
  needOld: Ember.computed.not('isAdmin'),
  showConfirm: Ember.computed.not('generated'),

  willInsertElement() {
    var account = this.get('originalModel').clone();
    var credential = this.get('originalModel.passwordCredential').clone();
    this.set('model', Ember.Object.create({
      account: account,
      credential: credential,
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

      if ( this.get('showConfirm') && old !== neu )
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
    if ( this.get('isAdmin') )
    {
      return this._super();
    }
    else
    {
      // Users can't update the account
      return this.didSave();
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
      });
    }
  },

  doneSaving() {
    this.sendAction('dismiss');

    // If you edit yourself and make yourself a user, drop the admin bit.
    if ( this.get('model.account.id') === this.get('session.'+C.SESSION.ACCOUNT_ID) && this.get('model.account.kind') !== 'admin' )
    {
      this.set('access.admin', false);
      this.set('session.'+C.SESSION.USER_TYPE, this.get('model.account.kind'));
    }
  },

  actions: {
    outsideClick() {
    },

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

    cancel() {
      this.sendAction('dismiss');
    }
  },
});
