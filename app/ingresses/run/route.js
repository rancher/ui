import { hash } from 'rsvp';
import { get, set } from '@ember/object'
import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const store = get(this, 'store');

    const dependencies = {
      namespacedcertificates: store.findAll('namespacedcertificate'),
      certificates:           store.findAll('certificate'),
    };

    if (params.ingressId) {
      dependencies['existingIngress'] = store.find('ingress', params.ingressId);
    }

    return hash(dependencies).then((hash) => {
      let ingress;

      if (hash.existingIngress) {
        if (`${ params.upgrade  }` === 'true') {
          ingress = hash.existingIngress.clone();
          hash.existing = hash.existingIngress;
        } else {
          ingress = hash.existingIngress.cloneForNew();
        }
        delete hash.existingIngress;
      } else {
        ingress = store.createRecord({
          type:  'ingress',
          name:  '',
          rules: [],
          tls:   [],
        });
      }
      hash.ingress = ingress;

      return hash;
    });
  },

  resetController(controller, isExisting) {
    if (isExisting) {
      set(controller, 'ingressId', null);
      set(controller, 'upgrade', null);
    }
  },

  actions: {
    cancel() {
      this.goToPrevious();
    },
  }
});
