import Ember from 'ember';

export default Ember.Component.extend({
  classNames:   ['box'],
  access:       Ember.inject.service(),
  modalService: Ember.inject.service('modal'),
  account:      null,

  actions: {
    editPassword() {
      this.get('account').send('edit');
    }
  }

});
