import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['appId', 'stackId', 'upgrade', 'catalog', 'namespaceId'],
  stackId:     null,
  upgrade:     null,
  showName:    true,
  catalog:     null,
  namespaceId: null,
  appId:       null,

  parentRoute: 'catalog-tab',

  actions: {
    cancel() {

      this.send('goToPrevious', 'apps-tab.index');

    }
  },
});
