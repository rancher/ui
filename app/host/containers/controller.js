import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import ContainerSparkStats from 'ui/mixins/container-spark-stats';

export default Ember.Controller.extend(Sortable, ContainerSparkStats, {
  statsSocket: null,

  sortableContent: Ember.computed.alias('model.instances'),
  sortBy: 'name',
  sorts: {
    state:    ['stateSort','name','id'],
    name:     ['name','id'],
    ip:       ['displayIp','name','id'],
    image:    ['imageUuid','command','name','id'],
  },
});


