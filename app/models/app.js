import Resource from 'ember-api-store/models/resource';
import { hasMany, reference } from 'ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { parseHelmExternalId } from 'ui/utils/parse-externalid';
import StateCounts from 'ui/mixins/state-counts';
import { inject as service } from '@ember/service';

const App = Resource.extend(StateCounts, {
  catalog:   service(),
  router:    service(),
  // pods:      hasMany('id', 'pod', 'appId'),
  // services:  hasMany('id', 'service', 'appId'),
  // workloads: hasMany('id', 'workload', 'appId'),
  // secrets:   hasMany('id', 'secret', 'appId'),
  // ingress:   hasMany('id', 'ingress', 'appId'),
  // volumes:   hasMany('id', 'persistentVolumeClaim', 'appId'),
  pods:      hasMany('installNamespace', 'pod', 'namespaceId'),
  services:  hasMany('installNamespace', 'service', 'namespaceId'),
  workloads: hasMany('installNamespace', 'workload', 'namespaceId'),
  secrets:   hasMany('installNamespace', 'secret', 'namespaceId'),
  ingress:   hasMany('installNamespace', 'ingress', 'namespaceId'),
  volumes:   hasMany('installNamespace', 'persistentVolumeClaim', 'namespaceId'),
  namespace: reference('namespaceId', 'namespace', 'clusterStore'),
  //workloads on pod

  init() {
    this._super(...arguments);
    this.defineStateCounts('pods', 'podStates', 'podCountSort');
  },

  externalIdInfo: computed('externalId', function() {
    return parseHelmExternalId(get(this, 'externalId'));
  }),

  catalogTemplate: computed('externalIdInfo.templateId', function() {
    return this.get('catalog').getTemplateFromCache(this.get('externalIdInfo.templateId'));
  }),

  actions: {
    edit() {
      let templateId = get(this, 'externalIdInfo.templateId');

      let catalogId  = get(this, 'externalIdInfo.catalog');

      get(this, 'router').transitionTo('catalog-tab.launch', templateId, {queryParams: {
        catalog: catalogId,
        namespaceId: get(this, 'model.installNamespace'),
        appId: get(this, 'id'),
      }});

    }
  },
});
export default App;
