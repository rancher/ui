import Ember from 'ember';

export default Ember.Route.extend({
  settings: Ember.inject.service(),
  model() {
    var userStore = this.get('userStore');
    return userStore.find('haConfig', null, {forceReload: true}).then((res) => {
      return Ember.Object.create({
        haConfig: res.objectAt(0),
        createScript: userStore.createRecord({type: 'haConfigInput'})
      });
    });
  },

  setupController(controller, model) {
    this._super(...arguments);
    if (model.haConfig.enabled) {
      controller.findProject();
    }
  }
});
