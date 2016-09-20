import Ember from 'ember';
import NewBalancer from 'ui/mixins/new-balancer';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend(NewBalancer, {
  classNames         : ['lacsso', 'modal-container', 'span-6', 'offset-3', 'modal-logs'],
  originalModel      : Ember.computed.alias('modalService.modalOpts'),

  actions: {
    done() {
      this.send('cancel');
    },
  },

  didInsertElement: function() {
    Ember.run.next(this, 'loadDependencies');
  },

  loadDependencies: function() {
    var service = this.get('originalModel');

    var dependencies = [
      this.get('allServicesService').choices(),
      this.get('store').findAllUnremoved('certificate'),
    ];

    Ember.RSVP.all(dependencies, 'Load service dependencies').then((results) => {
      var clone = service.clone();
      var lbConfig = clone.get('loadBalancerConfig');
      if ( !lbConfig )
      {
        lbConfig = this.get('store').createRecord({
          type: 'loadBalancerConfig'
        });
      }

      var haproxyConfig = lbConfig.get('haproxyConfig');
      if ( !haproxyConfig )
      {
        haproxyConfig = this.get('store').createRecord({
          type: 'haproxyConfig',
        });

        lbConfig.set('haproxyConfig', haproxyConfig);
      }

      clone.set('loadBalancerConfig', lbConfig);

      this.setProperties({
        service: clone,
        haproxyConfig: haproxyConfig,
        allServices: results[0],
        allCertificates: results[1],
        loading: false,
      });
    });
  },
});
