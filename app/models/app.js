import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { parseHelmExternalId } from 'ui/utils/parse-externalid';
import StateCounts from 'ui/mixins/state-counts';
import { inject as service } from '@ember/service';
import EndpointPorts from 'ui/mixins/endpoint-ports';
import { isEmpty } from '@ember/utils';
import C from 'ui/utils/constants';

const {
  HELM_VERSION_2:       helmV2,
  HELM_VERSION_3:       helmV3,
  HELM_VERSION_3_SHORT: helmV3Short,
} = C.CATALOG;

const App = Resource.extend(StateCounts, EndpointPorts, {
  catalog:      service(),
  router:       service(),
  clusterStore: service(),
  globalStore:  service(),
  modalService: service('modal'),

  canEdit:      false,

  namespace:       reference('targetNamespace', 'namespace', 'clusterStore'),
  catalogTemplate: reference('externalIdInfo.templateId', 'template', 'globalStore'),

  init() {
    this._super(...arguments);
    this.defineStateCounts('pods', 'podStates', 'podCountSort');
  },

  isHelm3: computed('helmVersion', function() {
    const { helmVersion = helmV2 } = this;

    if (helmVersion === helmV3 || helmVersion === helmV3Short) {
      return true;
    }

    return false;
  }),

  isIstio: computed('catalogTemplate.isIstio', function() {
    let { catalogTemplate } = this;

    if (catalogTemplate) {
      return get(this, 'catalogTemplate.isIstio')
    } else {
      return false;
    }
  }),

  pods: computed('namespace.pods.@each.{workloadId,state}', 'workloads.@each.workloadLabels', function() {
    return (get(this, 'namespace.pods') || []).filter((item) => {
      if ( item.state === 'removed' ) {
        return false;
      }

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

  displayAnswerStrings: computed('answers', function() {
    let out = [];
    let answers = get(this, 'answers') || {};

    Object.keys(answers).forEach((key) => {
      out.push(key + (answers[key] ? `=${ answers[key] }` : ''));
    });

    return out;
  }),

  externalIdInfo: computed('externalId', function() {
    return parseHelmExternalId(get(this, 'externalId'));
  }),

  canUpgrade: computed('actionLinks.{upgrade}', 'catalogTemplate', function() {
    let a = get(this, 'actionLinks') || {};

    return !!a.upgrade && !isEmpty(this.catalogTemplate);
  }),

  canClone: computed('catalogTemplate', function() {
    return !isEmpty(this.catalogTemplate);
  }),

  canRollback: computed('catalogTemplate', function() {
    return !isEmpty(this.catalogTemplate) && !!( this.actionLinks || {} ).rollback;
  }),

  availableActions: computed('actionLinks.{rollback,upgrade}', 'catalogTemplate', function() {
    return [
      {
        label:   'action.upgrade',
        icon:    'icon icon-edit',
        action:  'upgrade',
        enabled: get(this, 'canUpgrade')
      },
      {
        label:   'action.rollback',
        icon:    'icon icon-history',
        action:  'rollback',
        enabled: get(this, 'canRollback')
      },
      {
        label:   'action.viewYaml',
        icon:    'icon icon-file',
        action:  'viewYaml',
        enabled: !!get(this, 'isIstio')
      },
    ];
  }),

  actions: {
    viewYaml(){
      get(this, 'modalService').toggleModal('modal-istio-yaml', {
        escToClose: true,
        name:       get(this, 'displayName'),
        namespace:  get(this, 'namespace.id'),
        appId:      get(this, 'name'),
      });
    },

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
          istio:       get(this, 'isIstio')
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
