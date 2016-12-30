import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortableContent: Ember.computed.alias('model.displayEndpoints'),
  sortBy: 'ip',
  sorts: {
    ip:       ['ipAddress','port'],
    port:     ['port','ipAddress','instanceId'],
    service:  ['service.displayName','port','ipAddress'],
    container: ['instance.displayName','port','ipAddress'],
  },
});
