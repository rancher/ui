import Route from '@ember/routing/route';

export default Route.extend({
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
