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

export default Component.extend(ViewNewEdit, ChildHook, {
  intl: service(),

  layout,

  model:     null,
  metrics:   alias('model.metrics'),
  namespace: alias('model.namespace'),

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

    return (get(this, 'deployments') || []).filter((w) => get(w, 'namespaceId') === namespaceId);
  }),

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
