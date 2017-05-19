import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['stackId','serviceId','tab','upgrade','upgradeImage'],
  stackId: null,
  serviceId: null,
  tab: 'ssl',
  upgrade: null,
  upgradeImage: 'false',

  actions: {
    done() {
      this.send('goToPrevious','balancers.index');
    },

    cancel() {
      this.send('goToPrevious','balancers.index');
    },
  },
});
