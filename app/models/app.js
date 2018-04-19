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
  pods: computed('namespace.pods', 'workloads', function() {
    return (get(this, 'namespace.pods') || []).filter((item) => {
      if ( item['labels'] ) {
        const inApp = item['labels']['io.cattle.field/appId'] === get(this, 'name');
        if ( inApp ) {
          return true;
        }
      }

      const workload = get(item, 'workload');
      if ( workload ) {
        const found = get(this, 'workloads').filterBy('id', get(workload, 'id'));
        return found.length > 0;
      }
    });
  }),
  services: computed('namespace.services', function() {
    return (get(this, 'namespace.services') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === get(this, 'name');
      }
    });
  }),
  workloads: computed('namespace.workloads', function() {
    return (get(this, 'namespace.workloads') || []).filter((item) => {
      if ( item['workloadLabels'] ) {
        return item['workloadLabels']['io.cattle.field/appId'] === get(this, 'name');
      }
    });
  }),
  secrets: computed('namespace.secrets', function() {
    return (get(this, 'namespace.secrets') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === get(this, 'name');
      }
    });
  }),
  ingress: computed('namespace.ingress', function() {
    return (get(this, 'namespace.ingress') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === get(this, 'name');
      }
    });
  }),
  volumes: computed('namespace.volumes', function() {
    return (get(this, 'namespace.volumes') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === get(this, 'name');
      }
    });
  }),

  init() {
    this._super(...arguments);
    this.defineStateCounts('pods', 'podStates', 'podCountSort');
  },

  canEdit: false,

  externalIdInfo: computed('externalId', function() {
    return parseHelmExternalId(get(this, 'externalId'));
  }),

  catalogTemplate: computed('externalIdInfo.templateId', function() {
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

  availableActions: computed('actionLinks.{rollback,upgrade}', function() {
    let a = get(this, 'actionLinks');

    var choices = [
      { label: 'action.upgrade', icon: 'icon icon-edit', action: 'upgrade', enabled: !!a.upgrade },
      { label: 'action.rollback', icon: 'icon icon-history', action: 'rollback', enabled: !!a.rollback }
    ];

    return choices;
  })
})

export default App;
