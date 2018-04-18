import Resource from 'ember-api-store/models/resource';
import { hasMany, reference } from 'ember-api-store/utils/denormalize';
import { observer, computed, get } from '@ember/object';
import { parseHelmExternalId } from 'ui/utils/parse-externalid';
import StateCounts from 'ui/mixins/state-counts';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';

const App = Resource.extend(StateCounts, {
  catalog: service(),
  router: service(),
  clusterStore: service(),

  namespace: reference('installNamespace', 'namespace', 'clusterStore'),
  pods: alias('namespace.pods'),
  services: alias('namespace.services'),
  workloads: alias('namespace.workloads'),
  secrets: alias('namespace.secrets'),
  ingress: alias('namespace.ingress'),
  volumes: alias('namespace.volumes'),

  init() {
    this._super(...arguments);
    this.defineStateCounts('pods', 'podStates', 'podCountSort');
  },

  canEdit: false,

  canClone: false,

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
          namespaceId: get(this, 'model.installNamespace'),
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
    let l = get(this, 'links');
    let a = get(this, 'actionLinks');

    var choices = [
      { label: 'action.upgrade', icon: 'icon icon-edit', action: 'upgrade', enabled: !!a.upgrade },
      { label: 'action.rollback', icon: 'icon icon-history', action: 'rollback', enabled: !!a.rollback }
    ];

    return choices;
  })
})

export default App
