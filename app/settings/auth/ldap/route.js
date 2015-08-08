import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {

    var headers = {};
    headers[C.HEADER.PROJECT] = undefined;

    return this.get('store').find('ldapconfig', null, {headers: headers, forceReload: true}).then((collection) => {
      var existing = collection.get('firstObject');

      // On install the initial ldapconfig is empty.  For any fields that are empty, fill in the default from the schema.
      var defaults = this.get('store').getById('schema','ldapconfig').get('resourceFields');
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
      model: model.clone(),
      originalModel: model,
      confirmDisable: false,
      saving: false,
      saved: true,
      testing: false,
      wasShowing: false,
      organizations: this.get('session.orgs')||[],
      error: null,
      isEnterprise: (model.get('hostname') ? true : false),
    });
  }
});
