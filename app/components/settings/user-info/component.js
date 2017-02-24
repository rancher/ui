import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['p-20'],
  access: Ember.inject.service(),
  account: Ember.computed.alias('access.identity'),
  modalService: Ember.inject.service('modal'),
  actions: {
    editPassword() {
      this.get('account').send('edit');
    }
  }

});
