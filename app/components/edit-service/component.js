import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend(NewOrEdit, {
  classNames: ['lacsso', 'modal-container', 'large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  service: null,

  primaryResource: Ember.computed.alias('service'),

  editing: true,
  isService: true,

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

  init() {
    this._super(...arguments);
    this.set('service', this.get('originalModel').clone());
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
