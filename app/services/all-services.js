import Ember from 'ember';

export default Ember.Service.extend({
  intl: Ember.inject.service(),
  store: Ember.inject.service('store'),

  choices() {
    let store = this.get('store');
    let intl = this.get('intl');

    return Ember.RSVP.hash({
      stacks: store.findAll('stack'),
      services: store.findAll('service')
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

  list: function() {
    let intl = this.get('intl');
    let store = this.get('store');

    let services = this.get('_services');
    if ( !services ) {
      store.find('service');
      services = store.all('service');
      this.set('_services', services);
    }

    return services.filter((service) => service.get('system') !== true).map((service) => {
      let stackName = service.get('stack.displayName') || '('+service.get('stackId')+')';

      return {
        group: intl.t('allServices.stackGroup', {name: stackName}),
        id: service.get('id'),
        name: service.get('displayName'),
        kind: service.get('type'),
        lbSafe: (service.get('type').toLowerCase() !== 'externalservice' || service.get('hostname') === null),
        obj: service,
        stackName: stackName,
      };
    });
  }.property('_services.@each.{id,displayName,type,hostname}'),

  grouped: function() {
    let out = {};

    this.get('list').slice().sortBy('group','name','id').forEach((service) => {
      let ary = out[service.group];
      if( !ary ) {
        ary = [];
        out[service.group] = ary;
      }

      ary.push(service);
    });

    return out;
  }.property('list.[]'),
});
