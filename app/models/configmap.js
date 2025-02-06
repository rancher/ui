import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import { reference } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';
import { isEmpty } from '@ember/utils';

export default Resource.extend({
  router:       service(),
  clusterStore: service(),

  state:         'active',
  canClone:      true,
  canHaveLabels:  true,
  namespace:     reference('namespaceId', 'namespace', 'clusterStore'),

  firstKey: alias('keys.firstObject'),

  workloads: computed('name', 'namespace.workloads.@each.{containers,volumes}', function() {
    return (get(this, 'namespace.workloads') || []).filter((workload) => {
      const volume = (get(workload, 'volumes') || []).find((volume) => get(volume, 'configMap.name') === this.name);
      const env = (get(workload, 'containers') || []).find((container) => (get(container, 'environmentFrom') || []).find((env) => get(env, 'source') === 'configMap' && get(env, 'sourceName') === this.name));

      return volume || env;
    });
  }),

  keys: computed('data', 'binaryData', function() {
    const {
      data       = {},
      binaryData = {}
    } = this;

    const dataKeys       = Object.keys(data);
    const binaryDataKeys = Object.keys(binaryData);

    if (isEmpty(dataKeys)) {
      return binaryDataKeys;
    } else {
      return dataKeys;
    }
  }),

  configData: computed('data', 'binaryData', function() {
    const {
      data       = {},
      binaryData = {}
    } = this;

    return Object.assign({}, data, binaryData);
  }),

  actions: {
    edit() {
      this.router.transitionTo('authenticated.project.config-maps.detail.edit', this.id);
    },

    clone() {
      this.router.transitionTo('authenticated.project.config-maps.new', this.projectId, { queryParams: { id: this.id } });
    }

  },

});
