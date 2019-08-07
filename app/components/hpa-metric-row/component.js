import {
  get, set, setProperties, computed, observer
} from '@ember/object'
import Component from '@ember/component';
import layout from './template';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';

const RESOURCE = 'Resource';
const PODS = 'Pods';
const OBJECT = 'Object';
const EXTERNAL = 'External';
const MEMORY = 'memory';
const CPU = 'cpu';
const VALUE = 'Value';
const AVERAGE_VALUE = 'AverageValue';
const AVERAGE_UTILIZATION = 'Utilization';
const METRICS_TYPES = [
  {
    label: 'cruHpa.metrics.types.resource',
    value: RESOURCE,
  },
  {
    label: 'cruHpa.metrics.types.pods',
    value: PODS,
  },
  {
    label: 'cruHpa.metrics.types.object',
    value: OBJECT,
  },
  {
    label: 'cruHpa.metrics.types.external',
    value: EXTERNAL,
  }
];
const RESOURCE_TYPES = [
  {
    label: 'cruHpa.metrics.name.resources.cpu',
    value: CPU,
  },
  {
    label: 'cruHpa.metrics.name.resources.memory',
    value: MEMORY,
  },
];
const TARGET_TYPES = {
  VALUE: {
    label: 'cruHpa.metrics.target.options.value',
    value: VALUE,
  },
  AVERAGE_VALUE: {
    label: 'cruHpa.metrics.target.options.averageValue',
    value: AVERAGE_VALUE,
  },
  AVERAGE_UTILIZATION: {
    label: 'cruHpa.metrics.target.options.averageUtilization',
    value: AVERAGE_UTILIZATION,
  }
};

export default Component.extend({
  layout,

  editing: true,
  metric:  null,

  typeChoices:     METRICS_TYPES,
  resourceChoices: RESOURCE_TYPES,

  init() {
    this._super(...arguments);

    const metricTargetType = get(this, 'metric.target.type');
    const metricType = get(this, 'metric.type');
    const metricName = get(this, 'metric.name');
    const averageValue = get(this, 'metric.target.averageValue');

    if ( metricName === CPU && metricTargetType === AVERAGE_VALUE && metricType === RESOURCE ) {
      set(this, 'metric.target.stringValue', convertToMillis(averageValue));
    }

    if ( metricName === MEMORY && metricTargetType === AVERAGE_VALUE && metricType === RESOURCE ) {
      set(this, 'metric.target.stringValue', parseSi(averageValue, 1024) / 1048576)
    }
  },

  actions: {
    removeMetric(metric) {
      if ( this.removeMetric ) {
        this.removeMetric(metric);
      }
    },

    updateSelectorMatchLabels(labels) {
      if ( get(this, 'metric.selector') ) {
        set(this, 'metric.selector.matchLabels', labels);
      } else {
        set(this, 'metric.selector', { matchLabels: labels });
      }
    },

    updateSelectorMatchExpressions(expressions) {
      if ( get(this, 'metric.selector') ) {
        set(this, 'metric.selector.matchExpressions', expressions);
      } else {
        set(this, 'metric.selector', { matchExpressions: expressions });
      }
    },
  },

  targetTypeDidChange: observer('metric.target.type', function() {
    const target = get(this, 'metric.target');

    setProperties(target, {
      utilization:  null,
      averageValue: null,
      stringValue:  null,
      value:        null,
    });
  }),

  metricTypeDidChange: observer('metric.type', function() {
    const metric = get(this, 'metric');
    const type = get(metric, 'type');

    if ( type === RESOURCE  ) {
      delete metric['selector'];
      delete metric['describedObject'];
      setProperties(metric, {
        name:   CPU,
        target:       {
          type:         AVERAGE_UTILIZATION,
          value:        null,
          averageValue: null,
          stringValue:  null,
          utilization:  null,
        }
      });
    } else if ( type === EXTERNAL  ) {
      delete metric['describedObject'];
      setProperties(metric, {
        selector: null,
        name:     null,
        target:   {
          type:         AVERAGE_VALUE,
          value:        null,
          averageValue: null,
          utilization:  null,
        }
      });
    } else if ( type === OBJECT  ) {
      setProperties(metric, {
        selector:        null,
        name:            null,
        describedObject: {},
        target:          {
          type:         VALUE,
          value:        null,
          averageValue: null,
          utilization:  null,
        }
      });
    } else if ( type === PODS  ) {
      delete metric['describedObject'];
      setProperties(metric, {
        name:     null,
        selector: null,
        target:   {
          type:         AVERAGE_VALUE,
          value:        null,
          averageValue: null,
          utilization:  null,
        }
      });
    }
  }),

  metricAverageValueDidChange: observer('metric.target.type', 'metric.type', 'metric.name', 'metric.target.stringValue', function() {
    const metricTargetType = get(this, 'metric.target.type');
    const metricType = get(this, 'metric.type');
    const metricName = get(this, 'metric.name');
    const stringValue = get(this, 'metric.target.stringValue');

    if ( metricName === CPU && metricTargetType === AVERAGE_VALUE && metricType === RESOURCE ) {
      set(this, 'metric.target.averageValue', stringValue ? `${ stringValue }m` : null)
    }

    if ( metricName === MEMORY && metricTargetType === AVERAGE_VALUE && metricType === RESOURCE ) {
      set(this, 'metric.target.averageValue', stringValue ? `${ stringValue }Mi` : null)
    }
  }),

  targetChoices: computed('metric.type', function() {
    switch (get(this, 'metric.type')) {
    case RESOURCE:
      return [TARGET_TYPES.AVERAGE_VALUE, TARGET_TYPES.AVERAGE_UTILIZATION];
    case PODS:
      return [TARGET_TYPES.AVERAGE_VALUE];
    case EXTERNAL:
      return [TARGET_TYPES.VALUE, TARGET_TYPES.AVERAGE_VALUE];
    case OBJECT:
      return [TARGET_TYPES.VALUE, TARGET_TYPES.AVERAGE_VALUE];
    }
  }),

  showCpuReservationWarning: computed('metric.name', 'metric.type', 'metric.target.type', 'selectedWorkload.launchConfig.hasCpuReservation', function() {
    const targetType = get(this, 'metric.target.type');
    const type =  get(this, 'metric.type');
    const name = get(this, 'metric.name');
    const selectedWorkload = get(this, 'selectedWorkload');
    const hasCpuReservation = get(this, 'selectedWorkload.launchConfig.hasCpuReservation');

    if ( name === CPU && targetType === AVERAGE_UTILIZATION && type === RESOURCE && selectedWorkload ) {
      return !hasCpuReservation;
    } else {
      return false;
    }
  }),

  showMemoryReservationWarning: computed('metric.name', 'metric.type', 'metric.target.type', 'selectedWorkload.launchConfig.hasMemoryReservation', function() {
    const targetType = get(this, 'metric.target.type');
    const type =  get(this, 'metric.type');
    const name = get(this, 'metric.name');
    const selectedWorkload = get(this, 'selectedWorkload');
    const hasMemoryReservation = get(this, 'selectedWorkload.launchConfig.hasMemoryReservation');

    if ( name === MEMORY && targetType === AVERAGE_UTILIZATION && type === RESOURCE && selectedWorkload ) {
      return !hasMemoryReservation;
    } else {
      return false;
    }
  }),
});
