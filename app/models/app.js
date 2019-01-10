import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { parseHelmExternalId } from 'ui/utils/parse-externalid';
import StateCounts from 'ui/mixins/state-counts';
import { inject as service } from '@ember/service';
import EndpointPorts from 'ui/mixins/endpoint-ports';

const App = Resource.extend(StateCounts, EndpointPorts, {
  catalog:      service(),
  router:       service(),
  clusterStore: service(),
  globalStore:  service(),

  canEdit:   false,
  canClone: true,

  namespace:       reference('targetNamespace', 'namespace', 'clusterStore'),
  catalogTemplate: reference('externalIdInfo.templateId', 'template', 'globalStore'),

  init() {
    this._super(...arguments);
    this.defineStateCounts('pods', 'podStates', 'podCountSort');
  },

  pods:      computed('namespace.pods.@each.workloadId', 'workloads.@each.workloadLabels', function() {
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
  services: computed('namespace.services.@each.labels', function() {
    return (get(this, 'namespace.services') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === get(this, 'name');
      }
    });
  }),
  dnsRecords: computed('namespace.services.@each.labels', function() {
    return (get(this, 'namespace.services') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === get(this, 'name');
      }
    });
  }),
  workloads: computed('namespace.workloads.@each.workloadLabels', function() {
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
  configMaps: computed('namespace.configMaps', function() {
    return (get(this, 'namespace.configMaps') || []).filter((item) => {
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

  publicEndpoints: computed('workloads.@each.publicEndpoints', 'services.@each.proxyEndpoints', function() {
    let out = [];

    get(this, 'workloads').forEach((workload) => {
      (get(workload, 'publicEndpoints') || []).forEach((endpoint) => {
        out.push(endpoint);
      });
    });
    get(this, 'services').forEach((service) => {
      (get(service, 'proxyEndpoints') || []).forEach((endpoint) => {
        out.push(endpoint);
      });
    });

    return out;
  }),

  externalIdInfo: computed('externalId', function() {
    return parseHelmExternalId(get(this, 'externalId'));
  }),

  availableActions: computed('actionLinks.{rollback,upgrade}', function() {
    let a = get(this, 'actionLinks') || {};

    var choices = [
      {
        label:   'action.upgrade',
        icon:    'icon icon-edit',
        action:  'upgrade',
        enabled: !!a.upgrade
      },
      {
        label:   'action.rollback',
        icon:    'icon icon-history',
        action:  'rollback',
        enabled: !!a.rollback
      }
    ];

    return choices;
  }),
  actions: {
    upgrade() {
      const templateId    = get(this, 'externalIdInfo.templateId');
      const catalogId     = get(this, 'externalIdInfo.catalog');
      const vKeys         = Object.keys(get(this, 'catalogTemplate.versionLinks'));
      const latestVersion =  vKeys[vKeys.length - 1];

      get(this, 'router').transitionTo('catalog-tab.launch', templateId, {
        queryParams: {
          appId:       get(this, 'id'),
          catalog:     catalogId,
          namespaceId: get(this, 'targetNamespace'),
          upgrade:     latestVersion,
        }
      });
    },

    rollback() {
      get(this, 'modalService').toggleModal('modal-rollback-app', { originalModel: this });
    },

    clone() {
      const templateId    = get(this, 'externalIdInfo.templateId');
      const catalogId     = get(this, 'externalIdInfo.catalog');

      get(this, 'router').transitionTo('catalog-tab.launch', templateId, {
        queryParams: {
          appId:       get(this, 'id'),
          catalog:     catalogId,
          namespaceId: get(this, 'targetNamespace'),
          clone:       true
        }
      });
    }

  },

})

export default App;
