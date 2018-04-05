import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  catalog: service(),
  store:   service(),

  model(params) {
    const store = get(this, 'store');
    return store.find('app', get(params, 'app_id')).then( app => {
      return hash({
        workloads: store.find('workload'),
        pods: store.find('pod'),
        services: store.find('service'),
        volumes: store.find('persistentVolumeClaim'),
        secrets: store.find('secret'),
      }).then( (/* hash */) => {
        return {
          app: app,
        }
      });
    });

    // return hash({
    //   app: store.find('app', get(params, 'app_id')),
    // });
  },
});
