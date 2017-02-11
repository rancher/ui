import Ember from 'ember';

export default Ember.Component.extend({
  newPassword: null,
  confirmPassword: null,
  passwordOkay: false,
  passwordOut: null,
  passwordsMatch: Ember.computed('newPassword', 'confirmPassword', function() {
    if (this.get('confirmPassword')) {
      if ((this.get('newPassword') === this.get('confirmPassword'))) {
        this.set('passwordOut', this.get('newPassword'));
        this.set('passwordOkay', true);
        return true;
      } else {
        this.set('passwordOut', null);
        this.set('passwordOkay', false);
        return false;
      }
    } else {
      this.set('passwordOkay', false);
      return true;
    }
  })
});
