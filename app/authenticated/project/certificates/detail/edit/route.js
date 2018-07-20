import Route from '@ember/routing/route';
import {  set } from '@ember/object';

export default Route.extend({
  model() {
    const original = this.modelFor('authenticated.project.certificates.detail');

    set(this, 'originalModel', original);

    return original.clone();
  },

  setupController(controller/* , model*/) {
    this._super(...arguments);
    set(controller, 'originalModel', this.modelFor('authenticated.project.certificates.detail'));
  }
});
