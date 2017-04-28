import Ember from 'ember';
import FilteredSorted from 'ui/utils/filtered-sorted-array-proxy';

export default Ember.Route.extend({
  model: function(params) {
    var service = this.get('store').getById('service', params.scaling_group_id);
    if ( service )
    {
      return this.getServiceLogs(service).then((resp) => {
        return Ember.Object.create({
          service: service,
          stack: service.get('stack'),
          logs: resp.logs,
        });
      });
    }
    else
    {
      return this.get('store').find('service', params.scaling_group_id).then((service) => {
        return Ember.Object.create({
          service: service,
          stack: service.get('stack'),
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
