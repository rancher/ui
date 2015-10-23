import NewAlias from 'ui/components/new-aliasservice/component';
import Ember from 'ember';

export default NewAlias.extend({
  allServicesService: Ember.inject.service('all-services'),
  allServices: null,
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
});
