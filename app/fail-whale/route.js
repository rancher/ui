import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  storeReset: service(),
  settings:   service(),

  model() {
    return this.controllerFor('application').get('error');
  },

  afterModel(model) {
    if ( model ) {
      this.get('storeReset').reset();
    } else {
      this.transitionTo('authenticated');
    }
  },
  actions: {
    activate() {
      $('BODY').addClass('farm'); // eslint-disable-line
    },

    deactivate() {
      $('BODY').removeClass('farm'); // eslint-disable-line
    },
  },

});
