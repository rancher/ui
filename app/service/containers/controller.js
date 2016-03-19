import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import ContainerSparkStats from 'ui/mixins/container-spark-stats';

export default Ember.Controller.extend(Sortable, ContainerSparkStats, {
  sparkInstances: Ember.computed.alias('model.instances'),

  sortableContent: Ember.computed.alias('model.instances'),
  sortBy: 'name',
  sorts: {
    state:    ['stateSort','name','id'],
    name:     ['name','id'],
    ip:       ['sortIp','name','id'],
    host:     ['primaryHost.displayName','name','id'],
    image:    ['imageUuid','command','name','id'],
  },
});
