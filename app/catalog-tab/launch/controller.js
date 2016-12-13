import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','upgrade'],
  stackId: null,
  upgrade: null,

  parentRoute: 'catalog-tab',

  actions: {
    cancel() {
      this.transitionToRoute(this.get('parentRoute'));
    }
  },
});
