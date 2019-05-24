import Controller from '@ember/controller';
import { get, computed } from '@ember/object';

export default Controller.extend({
  queryParams: ['istio', 'appId', 'appName', 'stackId', 'upgrade', 'catalog', 'namespaceId', 'clone'],
  stackId:     null,
  upgrade:     null,
  showName:    true,
  catalog:     null,
  namespaceId: null,
  appId:       null,
  appName:     null,
  istio:       null,

  parentRoute: 'catalog-tab',

  actions: {
    cancel() {
      this.send('goToPrevious', 'apps-tab.index');
    }
  },

  isIstio: computed('istio', function() {
    return get(this, 'istio') === 'true';
  }),
});
