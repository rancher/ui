import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {
      allHosts: store.findAll('hosts'),
      allCertificates: store.findAll('certificate'),
    };

    if ( params.serviceId )
    {
      dependencies['existingService'] = store.find('service', params.serviceId);
    }

    return Ember.RSVP.hash(dependencies).then((hash) => {
      let service;
      if ( hash.existingService ) {
        if ( params.upgrade+'' === 'true' ) {
          service = hash.existingService.clone();

          if ( params.upgradeImage+'' === 'true' ) {
            service.set('launchConfig.imageUuid', 'docker:' + this.get(`settings.${C.SETTING.BALANCER_IMAGE}`));
          }

          hash.existing = hash.existingService;
        } else {
          service = hash.existingService.cloneForNew();
        }

        delete hash.existingService;
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
            imageUuid: 'docker:' + this.get(`settings.${C.SETTING.BALANCER_IMAGE}`),
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
      controller.set('upgrade', null);
      controller.set('upgradeImage', null);
    }
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
