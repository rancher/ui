import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel: function() {
    this._super(...arguments);
    this.transitionTo('hosts');
  }
});
