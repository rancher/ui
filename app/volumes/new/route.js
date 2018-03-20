import EmberObject, { get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model(/*params, transition*/) {
    const store = get(this,'store');
    return EmberObject.create({
      pvc: store.createRecord({
        type: 'persistentVolumeClaim',
      }),
    });
  },
});
