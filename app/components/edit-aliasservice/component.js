import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';
import NewServiceAlias from 'ui/mixins/new-service-alias';

export default ModalBase.extend(NewServiceAlias, {
  classNames: ['lacsso', 'modal-container', 'large-modal'],
  originalModel  : Ember.computed.alias('modalService.modalOpts'),
  allServicesService: Ember.inject.service('all-services'),
  editing: true,
  loading: true,
  existing: Ember.computed.alias('originalModel'),


  actions: {
    done() {
      this.send('cancel');
    },
  },

  didInsertElement: function() {
    Ember.run.next(this, 'loadDependencies');
  },

  doneSaving() {
    this.send('cancel');
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
