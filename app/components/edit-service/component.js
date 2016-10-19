import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend(NewOrEdit, {
  classNames: ['lacsso', 'modal-container', 'large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  service: null,

  primaryResource: Ember.computed.alias('service'),
  allServicesService: Ember.inject.service('all-services'),
  allServices: null,

  editing: true,
  isService: true,
  loading: true,

  actions: {
    done() {
      this.send('cancel');
    },
    setScale(scale) {
      this.set('service.scale', scale);
    },
    setServiceLinks(links) {
      this.set('serviceLinksArray', links);
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

  didSave() {
    var service = this.get('service');
    var ary = [];
    this.get('serviceLinksArray').forEach((row) => {
      if ( row.serviceId )
      {
        ary.push({name: row.name, serviceId: row.serviceId});
      }
    });

    return service.doAction('setservicelinks', {serviceLinks: ary});
  },

  doneSaving() {
    this.send('cancel');
  }
});
