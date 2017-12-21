import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';
import { get } from '@ember/object';

export default Controller.extend(NewOrEdit, {
  primaryResource: alias('model.account'),
  settings:        service(),
  intl:            service(),

  actions: {
    cancel() {
      this.transitionToRoute('accounts');
    },
  },

  validateDescription: computed(function() {
    return this.get('settings').get(C.SETTING.AUTH_LOCAL_VALIDATE_DESC) || null;
  }),

  doesExist() {
    let users = get(this, 'model.users');
    let account = get(this, 'model.account');

    if (users.findBy('userName', account.get('userName'))) {
      return true;
    }

    return false;
  },

  validate: function() {
    var errors = [];

    if ( (this.get('model.account.userName')||'').trim().length === 0 )
    {
      errors.push(this.get('intl').findTranslationByKey('accountsPage.new.errors.usernameReq'));
    }

    if (this.doesExist()) {
      errors.push(this.get('intl').findTranslationByKey('accountsPage.new.errors.usernameInExists'));
    }

    if ( (this.get('model.account.password')||'').trim().length === 0 )
    {
      errors.push(this.get('intl').findTranslationByKey('accountsPage.new.errors.pwReq'));
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

    return account.save();
  },

  doneSaving() {
    this.transitionToRoute('accounts');
  }
});
