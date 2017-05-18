import Ember from 'ember';
import fetch from 'ember-api-store/utils/fetch';

export default Ember.Route.extend({
  activate: function() {
    $('BODY').addClass('container-farm');
  },

  deactivate: function() {
    $('BODY').removeClass('container-farm');
  },

  model: function(params) {
    if (params.verify_token) {
      this.set('params', params);
      return fetch('/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({token: params.verify_token})
      }).then((resp) => {
        if (resp.status >= 200 && resp.status < 300) {
          return resp.body;
        }
      }).catch((err) => {
        return Ember.RSVP.reject(err.body);
      });

    } else {
      this.transitionTo('/');
    }
  },
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('token', this.get('params.verify_token'));
  }

});
