import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { parseHelmExternalId } from 'ui/utils/parse-externalid';
import StateCounts from 'ui/mixins/state-counts';
import { inject as service } from '@ember/service';

const App = Resource.extend(StateCounts, {
  catalog: service(),
  router: service(),
  clusterStore: service(),

  namespace: reference('targetNamespace', 'namespace', 'clusterStore'),
  pods: computed('namespace.pods', function() {
    return (get(this, 'namespace.pods')||[]).filterBy('labels.app', get(this, 'name'));
  }),
  services: computed('namespace.services', function() {
    return (get(this, 'namespace.services')||[]).filterBy('labels.app', get(this, 'name'));
  }),
  workloads: computed('namespace.workloads', function() {
    return (get(this, 'namespace.workloads')||[]).filterBy('labels.app', get(this, 'name'));
  }),
  secrets: computed('namespace.secrets', function() {
    return (get(this, 'namespace.secrets')||[]).filterBy('labels.app', get(this, 'name'));
  }),
  ingress: computed('namespace.ingress', function() {
    return (get(this, 'namespace.ingress')||[]).filterBy('labels.app', get(this, 'name'));
  }),
  volumes: computed('namespace.volumes', function() {
    return (get(this, 'namespace.volumes')||[]).filterBy('labels.app', get(this, 'name'));
  }),

  init() {
    this._super(...arguments);
    this.defineStateCounts('pods', 'podStates', 'podCountSort');
  },

  canEdit: false,

  externalIdInfo: computed('externalId', function () {
    return parseHelmExternalId(get(this, 'externalId'));
  }),

  catalogTemplate: computed('externalIdInfo.templateId', function () {
    return this.get('catalog').getTemplateFromCache(this.get('externalIdInfo.templateId'));
  }),

  actions: {
    upgrade() {
      let templateId = get(this, 'externalIdInfo.templateId');

      let catalogId = get(this, 'externalIdInfo.catalog');

      get(this, 'router').transitionTo('catalog-tab.launch', templateId, {
        queryParams: {
          catalog: catalogId,
          namespaceId: get(this, 'targetNamespace'),
          appId: get(this, 'id')
        }
      });
    },

    rollback() {
      get(this, 'modalService').toggleModal('modal-rollback-app', {
        originalModel: this
      });
    }
  },

  availableActions: computed('actionLinks.{rollback,upgrade}', function () {
    let a = get(this, 'actionLinks');

    var choices = [
      { label: 'action.upgrade', icon: 'icon icon-edit', action: 'upgrade', enabled: !!a.upgrade },
      { label: 'action.rollback', icon: 'icon icon-history', action: 'rollback', enabled: !!a.rollback }
    ];

    return choices;
  })
})

export default App;
