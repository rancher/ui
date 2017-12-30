import Route from '@ember/routing/route';
import { get, set } from '@ember/object';

export default Route.extend({
  model: function(params) {
    const original = this.modelFor('secrets.detail');
    set(this, 'originalModel', original);

    return original.clone();
  },

  setupController(controller, model) {
    this._super(...arguments);
    set(controller,'originalModel', this.modelFor('secrets.detail'));
  }
});
