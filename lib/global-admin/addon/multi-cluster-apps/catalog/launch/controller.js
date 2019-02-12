import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['appId', 'stackId', 'upgrade', 'catalog', 'clone'],
  stackId:     null,
  upgrade:     null,
  showName:    true,
  catalog:     null,
  appId:       null,
  clone:       null,

  parentRoute:  'multi-cluster-apps.catalog.index',

  actions: {
    cancel() {
      this.send('goToPrevious', `global-admin.${ this.parentRoute }`);
    }
  },
});
