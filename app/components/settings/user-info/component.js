import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['box'],

  access: Ember.inject.service(),
  account: Ember.computed.alias('access.identity'),
  modalService: Ember.inject.service('modal'),
  actions: {
    editPassword() {
      this.get('account').send('edit');
    }
  }

});
