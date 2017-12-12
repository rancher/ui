import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model(params) {
    let store = get(this, 'globalStore');

    return store.find('machinetemplate', get(params, 'template_id')).then(( template ) => {
      return store.find('machinedriver', get(template, 'driver.id')).then( ( driver ) => {
        return EmberObject.create({
          template: template,
          driver: driver,
        });
      })
    });
  },
});
