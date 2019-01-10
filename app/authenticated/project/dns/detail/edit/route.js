import Route from '@ember/routing/route';
import { get, set } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  model() {
    const store = get(this, 'store');
    const original = this.modelFor('authenticated.project.dns.detail').record;

    return hash({
      dnsRecords: store.findAll('service'),
      workloads:  store.findAll('workload'),
      record:     original.clone(),
    });
  },

  setupController(controller/* , model*/) {
    this._super(...arguments);
    const original = this.modelFor('authenticated.project.dns.detail');

    set(controller, 'originalModel', original);
  }
});
