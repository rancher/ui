import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['istio', 'appId', 'appName', 'stackId', 'upgrade', 'catalog', 'namespaceId', 'clone'],
  stackId:     null,
  upgrade:     null,
  showName:    true,
  catalog:     null,
  namespaceId: null,
  appId:       null,
  appName:     null,
  istio:       false,

  parentRoute: 'catalog-tab',

  actions: {
    cancel() {
      this.send('goToPrevious', 'apps-tab.index');
    }
  },
});
