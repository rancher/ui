import Route from '@ember/routing/route';
import {  get, set } from '@ember/object';

export default Route.extend({
  model() {
    const original = this.modelFor('authenticated.cluster.storage.classes.detail');

    set(this, 'originalModel', get(original, 'storageclass'));

    return get(original, 'storageclass').clone();
  },

  setupController(controller/* , model*/) {
    this._super(...arguments);
    set(controller, 'originalModel', this.modelFor('authenticated.cluster.storage.classes.detail'));
  }
});
