import NewBalancer from 'ui/components/new-balancer/component';
import Ember from 'ember';

export default NewBalancer.extend({
  settings: Ember.inject.service(),
  allServicesService: Ember.inject.service('all-services'),
  allServices: null,
  allCertificates: null,
  existing: Ember.computed.alias('originalModel'),
  editing: true,
  loading: true,

  actions: {
    done() {
      this.sendAction('dismiss');
    },

    outsideClick() {
      this.sendAction('dismiss');
    },

    cancel() {
      this.sendAction('dismiss');
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
