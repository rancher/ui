import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    $('BODY').addClass('container-farm');
  },

  model() {
    return {
      type: 'account',
      kind: 'user',
      name: '',
      email: '',
    };
  },
  deactivate: function() {
    $('BODY').removeClass('container-farm');
  }
});
