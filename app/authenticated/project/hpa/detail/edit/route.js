import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';

export default Route.extend({
  clusterStore:  service(),

  model() {
    const store = get(this, 'store');
    const clusterStore = get(this, 'clusterStore');
    const original = this.modelFor('authenticated.project.hpa.detail').hpa;

    return hash({
      deployments: store.findAll('workload').then((workloads) => workloads.filter((w) => w.type === 'statefulSet' || w.type === 'deployment')),
      apiServices: clusterStore.findAll('apiService'),
      hpa:         original.clone(),
    });
  },
});
