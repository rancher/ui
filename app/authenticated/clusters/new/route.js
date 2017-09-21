import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  catalog: Ember.inject.service(),
  settings: Ember.inject.service(),

  model() {
    let store = this.get('userStore');
    let def = JSON.parse(this.get(`settings.${C.SETTING.CLUSTER_TEMPLATE}`)) || {};

    def.type = 'cluster';
    def.systemStacks = (def.systemStacks||[]).map((stack) => {
      stack.type = 'stack';
      return stack;
    })

    let cluster = store.createRecord(def);

    return this.get('catalog').fetchTemplates({plusInfra: true}).then((templates) => {
      return Ember.Object.create({
        cluster: cluster,
        allTemplates: templates
      });
    });
  },
  teardownForComponentState: Ember.on('deactivate', function(){
    this.controller.setProperties({
      catalogItem:         null,
      editCatalog:         false,
      selectedTemplateUrl: null,
      catalogInfo:         null,
      _catalogInfoCache:   null,
      _prefetchInstance:   null,
      catalogId:           'all',
      category:            null,
      viewCatalog:         false,
      newSystemStack:      null,
    });
  })
});
