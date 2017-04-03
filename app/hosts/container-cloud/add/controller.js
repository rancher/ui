import Ember from 'ember';

export default Ember.Controller.extend({
  host: null,
  init() {
    this._super(...arguments);
    this.set('host', this.get('store').createRecord({type: 'host'}));
  },
  actions: {
    save() {
      this.transitionToRoute('hosts');
    },
    cancel() {
      this.transitionToRoute('hosts.container-cloud');
    }
  }
});
