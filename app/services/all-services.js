import Ember from 'ember';

export default Ember.Service.extend({
  intl: Ember.inject.service(),
  store: Ember.inject.service('store'),

  choices() {
    let store = this.get('store');
    let intl = this.get('intl');

    return Ember.RSVP.hash({
      stacks: store.findAll('stack'),
      services: store.find('service', null, {forceReload: true}) // Need force-reload to get response with mixed types
    }).then((hash) => {
      return hash.services.filter((service) => {
        return service.get('system') !== true;
      }).map((service) => {
        return {
          group: intl.t('allServices.stackGroup', {name: stackName(service)}),
          id: service.get('id'),
          name: service.get('displayName'),
          kind: service.get('type'),
          lbSafe: (service.get('type').toLowerCase() !== 'externalservice' || service.get('hostname') === null),
          obj: service,
          stackName: stackName(service),
        };
      });

      function stackObj(service) {
        return hash.stacks.filterBy('id', service.get('stackId'))[0];
      }

      function stackName(service) {
        var stack = stackObj(service);
        if ( stack )
        {
          return stack.get('displayName');
        }
        else
        {
          return intl.t('allServices.noName', {id: service.get('stackId')});
        }
      }
    });
  },
});
