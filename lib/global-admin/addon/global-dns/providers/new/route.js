import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model(params) {
    if (get(params, 'id')) {
      return this.globalStore.find('globaldnsprovider', params.id);
    } else {
      return this.initConfig('route53');
    }
  },

  setupController(controller, model) {
    if (model && model.id !== '') {
      controller.set('editing', true);
    }

    this._super(controller, model);
  },

  queryParams: { id: { refreshModel: true } },

  initConfig(configType = 'route53') {
    if (configType === 'route53') {
      return this.globalStore.createRecord({
        type:                  'globaldnsprovider',
        providerName:          'route53',
        name:                  '',
        route53ProviderConfig: {
          rootDomain: '',
          accessKey:  '',
          secretKey:  '',
        }
      });
    }
  },

});
