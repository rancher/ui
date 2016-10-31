import Ember from 'ember';

export default Ember.Route.extend({
  allServices: Ember.inject.service(),

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {
      allHosts: store.findAll('hosts'),
      allServices: this.get('allServices').choices(),
      allCertificates: store.findAll('certificate'),
    };

    if ( params.serviceId )
    {
      dependencies['existing'] = store.find('service', params.serviceId);
    }

    return Ember.RSVP.hash(dependencies).then((hash) => {
      let service;
      if ( hash.existing ) {
        service = hash.existing.cloneForNew();
        delete service.instanceIds;
      } else {
        service = store.createRecord({
          type: 'loadBalancerService',
          name: '',
          description: '',
          scale: 1,
          stackId: params.stackId,
          startOnCreate: true,
          launchConfig: store.createRecord({
            type: 'launchConfig',
            restartPolicy: {name: 'always'},
          }),
          lbConfig: store.createRecord({
            type: 'lbConfig',
            config: '',
            certificateIds: [],
            stickinessPolicy: null,
            portRules: [
              store.createRecord({
                type: 'portRule',
                protocol: 'http',
                priority: 1,
                access: 'public',
              }),
            ],
          }),
        });
      }

      hash.service = service;
      return hash;
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('tab', 'ssl');
      controller.set('stickiness', 'none');
      controller.set('stackId', null);
      controller.set('serviceId', null);
    }
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
