import Ember from 'ember';
import FilteredSorted from 'ui/utils/filtered-sorted-array-proxy';

export default Ember.Route.extend({
  model: function() {
    let par = this.modelFor('service');
    let serviceId = par.get('service.id');

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
        service: par.get('service'),
        stack: par.get('stack'),
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
