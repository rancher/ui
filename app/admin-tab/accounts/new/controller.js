import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Controller.extend(NewOrEdit, {
  primaryResource: Ember.computed.alias('model.account'),

  actions: {
    cancel() {
      this.transitionToRoute('admin-tab.accounts');
    },
  },

  accountTypeChoices: [
    {label: 'User', value: 'user'},
    {label: 'Admin', value: 'admin'},
  ],

  validate: function() {
    var errors = [];

    if (!this.get('model.credential.publicValue') )
    {
      errors.push('Login Username is requried');
    }

    if (!this.get('model.credential.secretValue') )
    {
      errors.push('Password is requried');
    }

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
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
