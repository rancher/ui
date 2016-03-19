import Ember from 'ember';

export default Ember.Service.extend({
  choices() {
    var store = this.get('store');
    return Ember.RSVP.hash({
      environments: store.findAllUnremoved('environment'),
      services: store.find('service', null, {forceReload: true}) // Need force-reload to get response with mixed types
    }).then((hash) => {
      return hash.services.map((service) => {
        return {
          group: 'Stack: ' + envName(service),
          id: service.get('id'),
          name: service.get('displayName'),
          kind: service.get('type'),
          lbSafe: (service.get('type').toLowerCase() !== 'externalservice' || service.get('hostname') === null),
          obj: service,
          envName: envName(service),
        };
      });

      function envObj(service) {
        return hash.environments.filterBy('id', service.get('environmentId'))[0];
      }

      function envName(service) {
        var env = envObj(service);
        if ( env )
        {
          return env.get('displayName');
        }
        else
        {
          return '(Stack ' + service.get('environmentId') + ')';
        }
      }
    });
  },
});
