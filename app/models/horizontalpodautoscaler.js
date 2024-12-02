import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
const VALUE = 'Value';
const AVERAGE_VALUE = 'AverageValue';
const AVERAGE_UTILIZATION = 'Utilization';

export default Resource.extend({
  clusterStore:  service(),
  router:        service(),

  canHaveLabels: true,

  workload:       reference('workloadId'),
  namespace:      reference('namespaceId', 'namespace', 'clusterStore'),

  currentMetrics: computed('metrics.@each.current', function() {
    return (this.metrics || []).map((metric) => get(metric, 'current'));
  }),

  displayMetrics: computed('currentMetrics.@each.{averageValue,utilization,value}', 'metrics', function() {
    return (this.metrics || [])
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
    return (this.displayMetrics || []).join(', ');
  }),

  hpaName: computed('id', function() {
    const items = this.id.split(':');

    if ( get(items, 'length') > 1 ) {
      return items[1];
    }

    return null;
  }),

  actions:      {
    edit() {
      this.router.transitionTo('authenticated.project.hpa.detail.edit', this.id);
    },

    clone() {
      this.router.transitionTo('authenticated.project.hpa.new', this.projectId, { queryParams: { id: this.id } });
    },
  },

});
