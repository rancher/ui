import Ember from 'ember';
import FilteredSorted from 'ui/utils/filtered-sorted-array-proxy';

export default Ember.Route.extend({
  model: function(params) {
    var service = this.get('store').getById('service', params.scaling_group_id);
    if ( service ) {
      return Ember.RSVP.hash({
        hosts:         this.get('store').findAll('host'),
        logs: this.getServiceLogs(service),
      }).then((hash) => {
        return Ember.Object.create({
          service: service,
          stack: service.get('stack'),
          logs: hash.logs,
          hosts: hash.hosts
        });
      });
    } else {
      return Ember.RSVP.hash({
        service: this.get('store').find('service', params.scaling_group_id),
        hosts:         this.get('store').findAll('host'),
      }).then((hash) => {
        return Ember.Object.create({
          service: hash.service,
          stack: hash.service.get('stack'),
          hosts: hash.hosts
        });
      });
    }
  },
  afterModel(model) {
    if (model.get('service.initPorts')) {
      model.get('service').initPorts();
    }
  },
  getServiceLogs(model) {
    let par = model;
    let serviceId = par.get('id');

    // Find just the recent ones for this service
    return this.get('store').find('serviceLog', null,{
      filter: {serviceId: serviceId},
      sortBy: 'id',
      sortOrder: 'desc',
      depaginate: false,
      limit: 100
    }).then(() => {
      let all = this.get('store').all('serviceLog');
      return Ember.Object.create({
        logs: FilteredSorted.create({
          sourceContent: all,
          sortProperties: ['createdTS:desc'],
          dependentKeys: ['sourceContent.@each.serviceId'],
          filterFn: function(log) {
            return log.get('serviceId') === serviceId;
          }
        })
      });
    });
  }
});
