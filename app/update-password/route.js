import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  access:       service(),

  model() {

    return {
      user: get(this, 'access.me'),
      code: get(this, 'access.userCode') || '',
    };

  },
  activate() {

    $('BODY').addClass('container-farm'); // eslint-disable-line

  },

  deactivate() {

    $('BODY').removeClass('container-farm'); // eslint-disable-line

  },

});
