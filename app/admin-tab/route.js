import Route from '@ember/routing/route';

export default Route.extend({
  activate() {
    this._super();
    this.controllerFor('authenticated').setPageScope('admin');
  },
});
