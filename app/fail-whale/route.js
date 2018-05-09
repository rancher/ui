import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  storeReset: service(),
  settings: service(),

  actions: {
    activate: function() {
      $('BODY').addClass('farm'); // eslint-disable-line
    },

    deactivate: function() {
      $('BODY').removeClass('farm'); // eslint-disable-line
    },
  },

  model: function() {
    return this.controllerFor('application').get('error');
  },

  afterModel: function(model) {
    if ( model ) {
      this.get('storeReset').reset();
    } else {
      this.transitionTo('authenticated');
    }
  }
});
