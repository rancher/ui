import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
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

  canEdit: false,

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

  pods: computed('name', 'namespace.pods.@each.{state,workloadId}', 'workloads.@each.workloadLabels', function() {
    return (get(this, 'namespace.pods') || []).filter((item) => {
      if ( item.state === 'removed' ) {
        return false;
      }

      if ( item['labels'] ) {
        const inApp = item['labels']['io.cattle.field/appId'] === this.name;

        if ( inApp ) {
          return true;
        }
      }

      const workload = get(item, 'workload');

      if ( workload ) {
        const found = this.workloads.filterBy('id', get(workload, 'id'));

        return found.length > 0;
      }
    });
  }),

  services: computed('name', 'namespace.services.@each.labels', function() {
    return (get(this, 'namespace.services') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === this.name;
      }
    });
  }),

  dnsRecords: computed('name', 'namespace.services.@each.labels', function() {
    return (get(this, 'namespace.services') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === this.name;
      }
    });
  }),

  workloads: computed('name', 'namespace.workloads.@each.workloadLabels', function() {
    return (get(this, 'namespace.workloads') || []).filter((item) => {
      if ( item['workloadLabels'] ) {
        return item['workloadLabels']['io.cattle.field/appId'] === this.name;
      }
    });
  }),

  secrets: computed('name', 'namespace.secrets', function() {
    return (get(this, 'namespace.secrets') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === this.name;
      }
    });
  }),

  configMaps: computed('name', 'namespace.configMaps', function() {
    return (get(this, 'namespace.configMaps') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === this.name;
      }
    });
  }),

  ingress: computed('name', 'namespace.ingress', function() {
    return (get(this, 'namespace.ingress') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === this.name;
      }
    });
  }),

  volumes: computed('name', 'namespace.volumes', function() {
    return (get(this, 'namespace.volumes') || []).filter((item) => {
      if ( item['labels'] ) {
        return item['labels']['io.cattle.field/appId'] === this.name;
      }
    });
  }),

  publicEndpoints: computed('workloads.@each.publicEndpoints', 'services.@each.proxyEndpoints', function() {
    let out = [];

    this.workloads.forEach((workload) => {
      (get(workload, 'publicEndpoints') || []).forEach((endpoint) => {
        out.push(endpoint);
      });
    });

    this.services.forEach((service) => {
      (get(service, 'proxyEndpoints') || []).forEach((endpoint) => {
        out.push(endpoint);
      });
    });

    return out;
  }),

  displayAnswerStrings: computed('answers', function() {
    let out = [];
    let answers = this.answers || {};

    Object.keys(answers).forEach((key) => {
      out.push(key + (answers[key] ? `=${ answers[key] }` : ''));
    });

    return out;
  }),

  externalIdInfo: computed('externalId', function() {
    return parseHelmExternalId(this.externalId);
  }),

  canUpgrade: computed('actionLinks.upgrade', 'catalogTemplate', function() {
    let a = this.actionLinks || {};

    return !!a.upgrade && !isEmpty(this.catalogTemplate);
  }),

  canClone: computed('catalogTemplate', function() {
    return !isEmpty(this.catalogTemplate);
  }),

  canRollback: computed('actionLinks', 'catalogTemplate', function() {
    return !isEmpty(this.catalogTemplate) && !!( this.actionLinks || {} ).rollback;
  }),

  availableActions: computed('actionLinks.{rollback,upgrade}', 'canRollback', 'canUpgrade', 'catalogTemplate', 'isIstio', function() {
    return [
      {
        label:   'action.upgrade',
        icon:    'icon icon-edit',
        action:  'upgrade',
        enabled: this.canUpgrade
      },
      {
        label:   'action.rollback',
        icon:    'icon icon-history',
        action:  'rollback',
        enabled: this.canRollback
      },
      {
        label:   'action.viewYaml',
        icon:    'icon icon-file',
        action:  'viewYaml',
        enabled: !!this.isIstio
      },
    ];
  }),

  actions: {
    viewYaml(){
      this.modalService.toggleModal('modal-istio-yaml', {
        escToClose: true,
        name:       this.displayName,
        namespace:  get(this, 'namespace.id'),
        appId:      this.name,
      });
    },

    upgrade() {
      const templateId    = get(this, 'externalIdInfo.templateId');
      const catalogId     = get(this, 'externalIdInfo.catalog');
      const vKeys         = Object.keys(get(this, 'catalogTemplate.versionLinks'));
      const latestVersion =  vKeys[vKeys.length - 1];
      const currentVersion = get(this, 'externalIdInfo.version')

      this.router.transitionTo('catalog-tab.launch', templateId, {
        queryParams: {
          appId:        this.id,
          catalog:      catalogId,
          namespaceId:  this.targetNamespace,
          upgrade:      latestVersion,
          istio:        this.isIstio,
          currentVersion
        }
      });
    },

    rollback() {
      this.modalService.toggleModal('modal-rollback-app', { originalModel: this });
    },

    clone() {
      const templateId    = get(this, 'externalIdInfo.templateId');
      const catalogId     = get(this, 'externalIdInfo.catalog');

      this.router.transitionTo('catalog-tab.launch', templateId, {
        queryParams: {
          appId:       this.id,
          catalog:     catalogId,
          namespaceId: this.targetNamespace,
          clone:       true
        }
      });
    }

  },

})

export default App;
