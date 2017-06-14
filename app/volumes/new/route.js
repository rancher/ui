import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var deps = {};
    if ( params.serviceId )
    {
      deps['service'] = store.find('service', params.serviceId);
    }

    return Ember.RSVP.hash(deps, 'Load dependencies').then(function(hash) {
      let record;

      let stackId = params.stackId;
      let stack;
      if ( stackId ) {
        stack = store.getById('stack', stackId);
      }

      // If the stack doesn't exist or isn't set, pick default
      if ( !stack ) {
        stack = store.all('stack').findBy('isDefault',true);
        if ( stack ) {
          stackId = stack.get('id');
        }
      }

      if ( hash.existing )
      {
        record = hash.existing.cloneForNew();
      }
      else
      {
        record = store.createRecord({
          type: 'externalservice',
          name: '',
          description: '',
          stackId: stackId,
          startOnCreate: true,
        });
      }

      return {
        record: record,
      };
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('stackId', null);
      controller.set('serviceId', null);
    }
  },
});
