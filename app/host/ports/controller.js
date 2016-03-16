import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortableContent: Ember.computed.alias('model.displayEndpoints'),
  sortBy: 'ip',
  sorts: {
    ip:       ['ipAddress','port'],
    port:     ['port','serviceId','instanceId'],
    service:  ['service.displayName','port','ipAddress'],
    instance: ['instance.displayName','port','ipAddress'],
  },
});
