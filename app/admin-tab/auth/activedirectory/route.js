import Ember from 'ember';

export default Ember.Route.extend({
  resourceType: 'ldapconfig',

  model: function() {
    // fake ldap config for now until i get a real config back from the api
    const ldapConfig = {
      "id": null,
      "type": "ldapconfig",
      "links": {},
      "baseType": "ldapconfig",
      "actionLinks": {},
      "accessMode": "unrestricted",
      "allowedIdentities": [],
      "connectionTimeout": 1000,
      "domain": null,
      "enabled": false,
      "groupMemberMappingAttribute": "memberOf",
      "groupNameField": "name",
      "groupObjectClass": "group",
      "groupSearchDomain": null,
      "groupSearchField": "sAMAccountName",
      "loginDomain": null,
      "name": "ldapconfig",
      "port": 389,
      "server": null,
      "serviceAccountPassword": null,
      "serviceAccountUsername": null,
      "tls": false,
      "userDisabledBitMask": 2,
      "userEnabledAttribute": "userAccountControl",
      "userLoginField": "sAMAccountName",
      "userMemberAttribute": "memberOf",
      "userNameField": "name",
      "userObjectClass": "person",
      "userSearchField": "sAMAccountName"
    };

    return this.get('authStore').find('config', null, {forceReload: true}).then((collection) => {

      if (!collection.enabled) {
        let existing = collection.ldapConfig;

        // this should all come from the ldap config in the schema but it does not exist right now
        Object.keys(ldapConfig).forEach((key) => {
          let field = ldapConfig[key];

          if ( field &&  !existing[key] ) {
            existing[key] = field;
          }

        });
      }

      return collection;
    });

    // return this.get('userStore').find(this.get('resourceType'), null, {forceReload: true}).then((collection) => {
    //   debugger;
    //   var existing = collection.get('firstObject');

    //   // On install the initial ldapconfig is empty.  For any fields that are empty, fill in the default from the schema.
    //   var defaults = this.get('userStore').getById('schema',this.get('resourceType')).get('resourceFields');
    //   Object.keys(defaults).forEach((key) => {
    //     var field = defaults[key];
    //     if ( field && field.default && !existing.get(key) )
    //     {
    //       existing.set(key, field.default);
    //     }
    //   });

    //   return existing;
    // });
  },

  setupController: function(controller, model) {
    controller.setProperties({
      model:          model,
      confirmDisable: false,
      testing:        false,
      organizations:  this.get('session.orgs')||[],
      errors:         null,
    });
  }
});
