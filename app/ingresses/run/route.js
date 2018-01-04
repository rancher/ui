import { hash } from 'rsvp';
import { get, set } from '@ember/object'
import Route from '@ember/routing/route';

export default Route.extend({
  model: function (params) {
    const store = get(this, 'store');
    const dependencies = {
      allCertificates: store.findAll('certificate'),
    };

    if (params.id) {
      dependencies['existingIngress'] = store.find('ingress', params.id);
    }

    return hash(dependencies).then((hash) => {
      let ingress;
      if (hash.existingIngress) {
        if (params.upgrade + '' === 'true') {
          ingress = hash.existingIngress.clone();
          hash.existing = hash.existingIngress;
        } else {
          ingress = hash.existingIngress.cloneForNew();
        }
        delete hash.existingIngress;
      } else {
        ingress = store.createRecord({
          type: 'ingress',
          name: '',
          rules: [],
          tls: [],
        });
      }
      hash.ingress = ingress;
      return hash;
    });
  },

  resetController: function (controller, isExisting) {
    if (isExisting) {
      set(controller, 'id', null);
      set(controller, 'upgrade', null);
    }
  },

  actions: {
    cancel: function () {
      this.goToPrevious();
    },
  }
});
