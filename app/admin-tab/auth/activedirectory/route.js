import Ember from 'ember';

export default Ember.Route.extend({
  resourceType: 'ldapconfig',
  access: Ember.inject.service(),

  model: function () {
    return this.get('authStore').find('config', null, {
      forceReload: true
    }).then((collection) => {

      if (!collection.enabled) {
        let existing = this.get('authStore').createRecord(collection.ldapConfig, {type: 'ldapconfig'});
        let defaults = this.get('authStore').getById('schema', this.get('resourceType')).get('resourceFields');

        Object.keys(defaults).forEach((key) => {
          var field = defaults[key];
          if (field && field.default && !existing.get(key)) {
            existing.set(key, field.default);
          }
        });

        collection.ldapConfig = existing;
      } else {
        collection.identity = this.get('access.identity');
      }
      return collection;
    });
  },

  setupController: function (controller, model) {
    controller.setProperties({
      model:          model,
      confirmDisable: false,
      testing:        false,
      organizations:  this.get('session.orgs') || [],
      errors:         null,
    });
  }
});
