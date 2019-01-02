import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  model(params) {
    const store = get(this, 'store');

    return hash({
      dnsRecords: store.findAll('service'),
      workloads:  store.findAll('workload'),
      record:     store.find('service', params.record_id),
    });
  },
});
