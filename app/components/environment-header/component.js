import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    changeStack(stack) {
      this.get('application').transitionToRoute('environment', stack.get('id'));
      this.sendAction('hideAddtlInfo');
    }
  }
});
