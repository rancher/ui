import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  router:       service(),
  allWorkloads: service(),

  state:         'active',
  canClone:      true,
  canHaveLabels: true,
  firstKey:      alias('keys.firstObject'),
  keys:          computed('data', function() {
    return Object.keys(this.data || {}).sort();
  }),

  workloads: computed('allWorkloads.list.@each.{containers,volumes}', 'name', 'namespaceId', function() {
    return (get(this, 'allWorkloads.list') || []).map((item) => item.obj).filter((workload) => {
      if ( this.namespaceId && get(workload, 'namespaceId') !== this.namespaceId) {
        return false;
      }
      const volume = (get(workload, 'volumes') || []).find((volume) => get(volume, 'secret.secretName') === this.name);
      const env = (get(workload, 'containers') || []).find((container) => (get(container, 'environmentFrom') || []).find((env) => get(env, 'source') === 'secret' && get(env, 'sourceName') === this.name));

      return volume || env;
    });
  }),

  actions: {
    edit() {
      this.router.transitionTo('authenticated.project.secrets.detail.edit', this.id);
    },

    clone() {
      this.router.transitionTo('authenticated.project.secrets.new', {
        queryParams: {
          id:   this.id,
          type: this.type
        }
      });
    }
  },

});
