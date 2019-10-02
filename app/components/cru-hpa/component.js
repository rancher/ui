import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import EmberObject from '@ember/object';
import { get, set, computed, observer } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';
import Errors from 'ui/utils/errors';
import ChildHook from 'shared/mixins/child-hook';
import { flattenLabelArrays } from 'shared/mixins/manage-labels';

const RESOURCE_METRICS_API_GROUP = 'metrics.k8s.io';

export default Component.extend(ViewNewEdit, ChildHook, {
  intl: service(),

  layout,

  model:       null,
  apiServices: null,
  metrics:     alias('model.metrics'),
  namespace:   alias('model.namespace'),

  didInsertElement() {
    if (get(this, 'metrics.length') === 0) {
      this.send('addMetric');
    }
  },

  actions: {
    addMetric() {
      const metric = EmberObject.create({
        type:   'Resource',
        name:   'cpu',
        target: {
          type:  'Utilization',
          value: null
        },
      });

      get(this, 'metrics').pushObject(metric);
    },

    removeMetric(metric) {
      get(this, 'metrics').removeObject(metric);
    },

    setLabels(labels) {
      set(this, 'model.labels', flattenLabelArrays(labels));
    },

  },

  namespaceDidChange: observer('deploymentsChoices', function() {
    const deployments = get(this, 'deploymentsChoices') || [];
    const found = deployments.findBy('id', get(this, 'model.workloadId'));

    if ( !found ) {
      set(this, 'model.workloadId', null);
    }
  }),

  selectedWorkload: computed('model.workloadId', 'deployments.[]', function() {
    return (get(this, 'deployments') || []).findBy('id', get(this, 'model.workloadId'));
  }),

  deploymentsChoices: computed('namespace.id', 'deployments.[]', function() {
    const namespaceId = get(this, 'namespace.id');

    return (get(this, 'deployments') || []).filter((w) => get(w, 'namespaceId') === namespaceId).sortBy('displayName');
  }),

  resourceMetricsAvailable: computed('apiServices', function() {
    const apiServices = get(this, 'apiServices') || [];

    return apiServices.find((api) => get(api, 'name').split('.').length === 4 && get(api, 'name').endsWith(RESOURCE_METRICS_API_GROUP));
  }),

  validate() {
    this._super();

    const intl = get(this, 'intl');

    const errors = get(this, 'errors') || [];

    if ( get(this, 'model.minReplicas') === null ) {
      errors.pushObject(intl.t('validation.required', { key: intl.t('cruHpa.minReplicas.label') }));
    }

    (get(this, 'model.metrics') || []).forEach((metric) => {
      if ( get(metric, 'target.type') === 'Utilization' && (!get(metric, 'target.utilization')) ) {
        errors.pushObject(intl.t('validation.required', { key: intl.t('cruHpa.metrics.value.label') }));
      }

      if ( get(metric, 'target.type') === 'AverageValue' && (!get(metric, 'target.averageValue')) ) {
        errors.pushObject(intl.t('validation.required', { key: intl.t('cruHpa.metrics.value.label') }));
      }

      if ( get(metric, 'target.type') === 'Value' && (!get(metric, 'target.value')) ) {
        errors.pushObject(intl.t('validation.required', { key: intl.t('cruHpa.metrics.value.label') }));
      }
    });

    set(this, 'errors', errors.uniq());

    return errors.length === 0;
  },

  willSave() {
    set(this, 'model.namespaceId', get(this, 'namespace.id') || '__placeholder__');
    const self = this;
    const sup = this._super;
    const errors = [];

    errors.pushObjects(get(this, 'namespaceErrors') || []);
    set(this, 'errors', errors);

    if ( get(errors, 'length') !== 0 ) {
      return false;
    }

    return this.applyHooks('_beforeSaveHooks').then(() => {
      set(this, 'model.namespaceId', get(this, 'namespace.id'));

      return sup.apply(self, ...arguments);
    }).catch((err) => {
      set(this, 'errors', [Errors.stringify(err)]);
    });
  },
});
