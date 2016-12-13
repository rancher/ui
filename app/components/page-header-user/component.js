import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  tagName: '',

  access: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

  accessEnabled    : Ember.computed.alias('access.enabled'),

  isLocalAuth: function() {
    return this.get('access.enabled') && this.get('access.provider') === 'localauthconfig';
  }.property('access.{enabled,provider}'),

  actions: {
    changePassword() {
      let us = this.get('userStore');

      us.findAll('password').then(() => {
        us.find('account', this.get('session.'+C.SESSION.ACCOUNT_ID)).then((account) => {
          this.get('modalService').toggleModal('edit-account', account);
        });
      });
    },
  },
});
