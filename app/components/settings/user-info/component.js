import Ember from 'ember';

export default Ember.Component.extend({
  classNames:   ['box-borderless'],
  access:       Ember.inject.service(),
  modalService: Ember.inject.service('modal'),
  account:      null,

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('account', this.get('access.identity'));
  },

  actions: {
    editPassword() {
      this.get('account').send('edit');
    }
  }

});
