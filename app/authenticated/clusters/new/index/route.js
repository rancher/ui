import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  clusterStore: service('cluster-store'),
  catalog: service(),
  settings: service(),

  model() {
    // TODO - !!FORDEV!! removed for dev sake
    let store = this.get('clusterStore');
    let def = JSON.parse(this.get(`settings.${C.SETTING.CLUSTER_TEMPLATE}`)) || {};

    def.type = 'cluster';
    // def.systemStacks = (def.systemStacks||[]).map((stack) => {
    //   stack.type = 'stackConfiguration';
    //   return stack;
    // });

    let cluster = store.createRecord(def);

    // return this.get('catalog').fetchTemplates({plusInfra: true}).then((templates) => {
    //   return EmberObject.create({
    //     cluster: cluster,
    //     allTemplates: templates
    //   });
    // });
    return EmberObject.create({cluster: cluster, allTemplates: []});
  },
  // teardownForComponentState: on('deactivate', function(){
  //   this.controller.setProperties({
  //     catalogItem:         null,
  //     editCatalog:         false,
  //     selectedTemplateUrl: null,
  //     catalogInfo:         null,
  //     _catalogInfoCache:   null,
  //     _prefetchInstance:   null,
  //     catalogId:           'all',
  //     category:            null,
  //     viewCatalog:         false,
  //     newSystemStack:      null,
  //   });
  // })
});
