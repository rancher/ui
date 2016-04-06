import Ember from 'ember';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  beforeModel() {
    return Ember.RSVP.all([
      this.get('store').find('schema','haconfig', {authAsUser: true}),
      this.get('store').find('schema','haconfiginput', {authAsUser: true}),
    ]);
  },

  model() {
    var store = this.get('store');
    return store.find('haConfig', null, {authAsUser: true, forceReload: true}).then((res) => {
      return Ember.Object.create({
        haConfig: res.objectAt(0),
        createScript: store.createRecord({type: 'haConfigInput'})
      });
    });
  },

  setupController(controller/*, model*/) {
    this._super(...arguments);
    controller.findProject();
  }
});
