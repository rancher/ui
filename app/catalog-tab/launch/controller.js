import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['environmentId','upgrade'],
  environmentId: null,
  upgrade: null,

  parentRoute: 'catalog-tab',

  actions: {
    cancel() {
      this.transitionToRoute(this.get('parentRoute'));
    }
  },
});
