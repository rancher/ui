import Ember from 'ember';

export default Ember.Route.extend({
  resourceType: 'ldapconfig',

  model: function() {

    return this.get('userStore').find(this.get('resourceType'), null, {forceReload: true}).then((collection) => {
      var existing = collection.get('firstObject');

      // On install the initial ldapconfig is empty.  For any fields that are empty, fill in the default from the schema.
      var defaults = this.get('userStore').getById('schema',this.get('resourceType')).get('resourceFields');
      Object.keys(defaults).forEach((key) => {
        var field = defaults[key];
        if ( field && field.default && !existing.get(key) )
        {
          existing.set(key, field.default);
        }
      });

      return existing;
    });
  },

  setupController: function(controller, model) {
    controller.setProperties({
      model: model,
      confirmDisable: false,
      testing: false,
      organizations: this.get('session.orgs')||[],
      errors: null,
    });
  }
});
