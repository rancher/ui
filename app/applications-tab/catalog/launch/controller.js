import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['environmentId','upgrade'],
  environmentId: null,
  upgrade: null,

  parentRoute: 'applications-tab.catalog',

  actions: {
    cancel() {
      this.send('goToPrevious', this.get('parentRoute'));
    }
  },
});
