import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import ContainerSparkStats from 'ui/mixins/container-spark-stats';

export default Ember.Controller.extend(Sortable, ContainerSparkStats, {
  sortableContent: Ember.computed.alias('model.instances'),
  sortBy: 'name',
  sorts: {
    state:    ['combinedState','name','id'],
    name:     ['name','id'],
    ip:       ['displayIp','name','id'],
    image:    ['imageUuid','id'],
    command:  ['command','name','id'],
  },
});


