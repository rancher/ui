import Ember from 'ember';

export default Ember.Route.extend({
  activate() {
    this._super();
    this.controllerFor('authenticated').setPageScope('admin');
  },
});
