import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(NewOrEdit, {
  primaryResource: Ember.computed.alias('model.account'),
  settings: Ember.inject.service(),

  actions: {
    cancel() {
      this.transitionToRoute('admin-tab.accounts');
    },
  },

  validateDescription: Ember.computed(function() {
    return this.get('settings').get(C.SETTING.AUTH_LOCAL_VALIDATE_DESC) || null;
  }),

  accountTypeChoices: [
    {label: 'model.account.kind.user', value: 'user'},
    {label: 'model.account.kind.admin', value: 'admin'},
  ],

  validate: function() {
    var errors = [];

    if ( (this.get('model.credential.publicValue')||'').trim().length === 0 )
    {
      errors.push('Login Username is requried');
    }

    if ( (this.get('model.credential.secretValue')||'').trim().length === 0 )
    {
      errors.push('Password is requried');
    }

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }
    else
    {
      this.set('errors', null);
    }

    return true;
  },

  didSave() {
    var account = this.get('model.account');
    var cred = this.get('model.credential');

    cred.set('accountId', account.get('id'));
    return cred.save().then(() => {
      return cred.waitForState('active');
    });
  },

  doneSaving() {
    this.transitionToRoute('admin-tab.accounts');
  }
});
