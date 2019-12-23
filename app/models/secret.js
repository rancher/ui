import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import Resource from '@rancher/ember-api-store/models/resource';

export default Resource.extend({
  router:       service(),
  allWorkloads: service(),

  state:         'active',
  canClone:      true,
  canHaveLabels: true,
  firstKey:      alias('keys.firstObject'),
  keys:          computed('data', function() {
    return Object.keys(get(this, 'data') || {}).sort();
  }),

  workloads: computed('allWorkloads.list.@each.volumes', 'allWorkloads.list.@each.containers', function() {
    return (get(this, 'allWorkloads.list') || []).map((item) => item.obj).filter((workload) => {
      if ( get(this, 'namespaceId') && get(workload, 'namespaceId') !== get(this, 'namespaceId')) {
        return false;
      }
      const volume = (get(workload, 'volumes') || []).find((volume) => get(volume, 'secret.secretName') === get(this, 'name'));
      const env = (get(workload, 'containers') || []).find((container) => (get(container, 'environmentFrom') || []).find((env) => get(env, 'source') === 'secret' && get(env, 'sourceName') === get(this, 'name')));

      return volume || env;
    });
  }),

  actions: {
    edit() {
      get(this, 'router').transitionTo('authenticated.project.secrets.detail.edit', get(this, 'id'));
    },

    clone() {
      get(this, 'router').transitionTo('authenticated.project.secrets.new', {
        queryParams: {
          id:   get(this, 'id'),
          type: get(this, 'type')
        }
      });
    }
  },

});
