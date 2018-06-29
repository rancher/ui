import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  model(params) {

    const store = get(this, 'store');

    return hash({
      dnsRecords: store.findAll('dnsRecord'),
      workloads:  store.findAll('workload'),
      record:     store.find('dnsRecord', params.record_id),
    });

  },
});
