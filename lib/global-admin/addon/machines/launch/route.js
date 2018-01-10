import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model(params) {
    let store = get(this, 'globalStore');

    return store.find('machinetemplate', get(params, 'template_id')).then(( template ) => {
      return hash({
        driver: store.find('machinedriver', get(template, 'driver')),
        clusters: store.findAll('cluster'),
      }).then((hash) => {
        return EmberObject.create({
          clusters: hash.clusters,
          driver: hash.driver,
          template,
        });
      });
    });
  },
});
