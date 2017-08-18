import Ember from 'ember';
import FilteredSorted from 'ui/utils/filtered-sorted-array-proxy';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('service', params.service_id).then((service) => {
      return this.getServiceLogs(service.get('id')).then((logs) => {
        return Ember.Object.create({
          service,
          logs,
        });
      });
    });
  },

  afterModel(model) {
    if (model.get('service.initPorts')) {
      model.get('service').initPorts();
    }
  },

  getServiceLogs(serviceId) {
    // Find just the recent ones for this service
    return this.get('store').find('serviceLog', null,{
      filter: {serviceId: serviceId},
      sortBy: 'id',
      sortOrder: 'desc',
      depaginate: false,
      limit: 100
    }).then(() => {
      return FilteredSorted.create({
        sourceContent: this.get('store').all('serviceLog'),
        dependentKeys: ['sourceContent.@each.serviceId'],
        filterFn: function(log) {
          return log.get('serviceId') === serviceId;
        }
      });
    });
  },

  setupController(controller, model) {
    this._super(...arguments);

    let lc = model.get('service.launchConfig');
    if (lc) {
      controller.setProperties({
        fixedLaunchConfig:  lc,
        activeLaunchConfig: lc,
      });
    }
  }
});
