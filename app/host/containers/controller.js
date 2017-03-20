import Ember from 'ember';
import ContainerSparkStats from 'ui/mixins/container-spark-stats';

export default Ember.Controller.extend(ContainerSparkStats, {
  queryParams: ['sortBy'],
  sortBy: 'name',

  statsSocket: null,
});
