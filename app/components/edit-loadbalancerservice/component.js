import NewBalancer from 'ui/components/new-balancer/component';
import Ember from 'ember';

export default NewBalancer.extend({
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
      this.setProperties({
        service: clone,
        allServices: results[0],
        allCertificates: results[1],
        loading: false,
      });
    });
  },
});
