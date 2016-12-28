import Ember from 'ember';

export default Ember.Service.extend({
  intl: Ember.inject.service(),
  store: Ember.inject.service(),

  list: function() {
    let intl = this.get('intl');

    return this.get('_allServices').filter((service) => service.get('system') !== true).map((service) => {
      let stackName = service.get('stack.displayName') || '('+service.get('stackId')+')';

      return {
        group: intl.t('allServices.stackGroup', {name: stackName}),
        id: service.get('id'),
        stackName: stackName,
        name: service.get('displayName'),
        kind: service.get('type'),
        obj: service,
      };
    });
  }.property('_allServices.@each.{id,system,displayName,type,hostname}'),

  grouped: function() {
    return this.group(this.get('list'));
  }.property('list.[]'),

  group(list) {
    let out = {};

    list.slice().sortBy('group','name','id').forEach((service) => {
      let ary = out[service.group];
      if( !ary ) {
        ary = [];
        out[service.group] = ary;
      }

      ary.push(service);
    });

    return out;
  },

  _allServices: function() {
    let store = this.get('store');
    store.find('service');
    return store.all('service');
  }.property(),

  byId(id) {
    return this.get('_allServices').findBy('id',id);
  },
});
