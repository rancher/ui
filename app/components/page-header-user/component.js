import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  tagName: '',

  access: Ember.inject.service(),

  accessEnabled    : Ember.computed.alias('access.enabled'),

  isLocalAuth: function() {
    return this.get('access.enabled') && this.get('access.provider') === 'localauthconfig';
  }.property('access.{enabled,provider}'),

  actions: {
    changePassword() {
      this.get('store').find('account', this.get('session.'+C.SESSION.ACCOUNT_ID)).then((account) => {
        this.get('application').setProperties({
          editAccount: true,
          originalModel: account
        });
      });
    },
  },
});
