import Ember from 'ember';

export default Ember.Service.extend({
  choices() {
    return this.get('store').findAll('environment').then((environments) => {
      var promises = environments.map((env) => { return env.followLink('services'); });

      return Ember.RSVP.all(promises, 'Get all services').then((list) => {
        var out = [];

        list.forEach((services) => {
          services.forEach((service) => {
            out.pushObject({
              group: 'Stack: ' + envName(service),
              id: service.get('id'),
              name: service.get('displayName'),
              kind: service.get('type'),
              lbSafe: (service.get('type').toLowerCase() !== 'externalservice' || service.get('hostname') === null),
              obj: service,
            });
          });
        });

        return out;
      });

      function envName(service) {
        var env = environments.filterProperty('id', service.get('environmentId'))[0];
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
