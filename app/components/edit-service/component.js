import NewContainer from 'ui/components/new-container/component';
import Ember from 'ember';

export default NewContainer.extend({
  service: null,

  primaryResource: Ember.computed.alias('service'),
  allServicesService: Ember.inject.service('all-services'),
  allServices: null,

  editing: true,
  isService: true,
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
    ];

    Ember.RSVP.all(dependencies, 'Load container dependencies').then((results) => {
      var clone = service.clone();
      this.setProperties({
        service: clone,
        allServices: results[0],
        loading: false,
      });
    });
  },

  doneSaving() {
    this.sendAction('dismiss');
  }
});
