import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  access:       service(),

  activate() {
    $('BODY').addClass('container-farm');
  },

  deactivate() {
    $('BODY').removeClass('container-farm');
  },

  model: function() {
    return {
      user: get(this, 'access.me'),
      code: get(this, 'access.userCode')||'',
    };
  },
});
