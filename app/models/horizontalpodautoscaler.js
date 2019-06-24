import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
const VALUE = 'Value';
const AVERAGE_VALUE = 'AverageValue';
const AVERAGE_UTILIZATION = 'Utilization';

export default Resource.extend({
  clusterStore:  service(),
  router:        service(),

  canHaveLabels:  true,

  workload:       reference('workloadId'),
  namespace:      reference('namespaceId', 'namespace', 'clusterStore'),
  displayMetrics: computed('metrics.@each.current.{averageValue,utilization,value}', function() {
    return (get(this, 'metrics') || [])
      .map((metric) => {
        const arr = [];
        const averageValue = get(metric, 'current.averageValue');
        const utilization = get(metric, 'current.utilization');
        const value = get(metric, 'current.value');
        const targetType = get(metric, 'target.type');

        if ( value ) {
          arr.push(value);
        }
        if ( averageValue ) {
          arr.push(averageValue);
        }
        if ( utilization || utilization === 0 ) {
          arr.push(`${ utilization }%`);
        }

        switch (targetType) {
        case VALUE:
          arr.push(get(metric, 'target.value'));
          break;
        case AVERAGE_VALUE:
          arr.push(get(metric, 'target.averageValue'));
          break;
        case AVERAGE_UTILIZATION:
          arr.push(`${ get(metric, 'target.utilization') }%`);
          break;
        }

        return arr.join(' / ');
      });
  }),

  displayMetricsString: computed('displayMetrics', function() {
    return (get(this, 'displayMetrics') || []).join(', ');
  }),

  hpaName: computed('id', function() {
    const items = get(this, 'id').split(':');

    if ( get(items, 'length') > 1 ) {
      return items[1];
    }
  }),

  actions:      {
    edit() {
      get(this, 'router').transitionTo('authenticated.project.hpa.detail.edit', this.get('id'));
    },

    clone() {
      get(this, 'router').transitionTo('authenticated.project.hpa.new', this.get('projectId'), { queryParams: { id: this.get('id') } });
    },
  },

});
