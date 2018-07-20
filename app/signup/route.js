import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return {
      type:  'account',
      kind:  'user',
      name:  '',
      email: '',
    };
  },
  activate() {
    $('BODY').addClass('container-farm'); // eslint-disable-line
  },

  deactivate() {
    $('BODY').removeClass('container-farm'); // eslint-disable-line
  }
});
