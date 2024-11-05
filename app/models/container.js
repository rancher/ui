import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import DisplayImage from 'shared/mixins/display-image';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Grafana from 'shared/mixins/grafana';
import { alias } from '@ember/object/computed';
import { later } from '@ember/runloop';
import C from 'ui/utils/constants';

var Container = Resource.extend(Grafana, DisplayImage, {
  modalService: service('modal'),
  intl:         service(),
  scope:        service(),
  router:       service(),

  links:        {},
  type:         'container',

  grafanaDashboardName: 'Pods',
  pod:                  reference('podId'),
  grafanaResourceId:    alias('name'),

  podName: computed('pod.name', function() {
    return get(this, 'pod.name');
  }),

  namespaceId: computed('pod.namespaceId', function() {
    return get(this, 'pod.namespaceId');
  }),

  canShell: computed('state', function() {
    return C.CAN_SHELL_STATES.indexOf(this.state) > -1;
  }),

  availableActions: computed('canShell', function() {
    const canShell = this.canShell;

    var choices = [
      {
        label:     'action.execute',
        icon:      'icon icon-terminal',
        action:    'shell',
        enabled:   canShell,
        altAction: 'popoutShell',
      },
      {
        label:     'action.logs',
        icon:      'icon icon-file',
        action:    'logs',
        enabled:   true,
        altAction: 'popoutLogs',
      },
    ];

    return choices;
  }),

  restarts: computed('name', 'pod.status.containerStatuses.@each.restartCount', function() {
    const state = (get(this, 'pod.status.containerStatuses') || []).findBy('name', this.name);

    if ( state ) {
      return get(state, 'restartCount');
    }

    return 0;
  }),

  hasCpuReservation: computed('resources.requests.cpu', function() {
    return !!get(this, 'resources.requests.cpu');
  }),

  hasMemoryReservation: computed('resources.requests.memory', function() {
    return !!get(this, 'resources.requests.memory');
  }),

  validateQuota(namespace) {
    const projectLimit =  get(this, 'scope.currentProject.resourceQuota.limit');

    if ( !projectLimit ) {
      return [];
    }

    const intl = this.intl;
    const errors = [];

    const {
      limitsCpu, limitsMemory, requestsCpu, requestsMemory
    } = projectLimit;

    if ( limitsCpu && !get(this, 'resources.limits.cpu') && !get(namespace, 'containerDefaultResourceLimit.limitsCpu') ) {
      errors.push(intl.t('newContainer.errors.quotaRequired', { key: intl.t('formResourceQuota.resources.limitsCpu') }));
    }
    if ( limitsMemory && !get(this, 'resources.limits.memory') && !get(namespace, 'containerDefaultResourceLimit.limitsMemory') ) {
      errors.push(intl.t('newContainer.errors.quotaRequired', { key: intl.t('formResourceQuota.resources.limitsMemory') }));
    }
    if ( requestsCpu && !get(this, 'resources.requests.cpu') && !get(namespace, 'containerDefaultResourceLimit.requestsCpu') ) {
      errors.push(intl.t('newContainer.errors.quotaRequired', { key: intl.t('formResourceQuota.resources.requestsCpu') }));
    }
    if ( requestsMemory && !get(this, 'resources.requests.memory') && !get(namespace, 'containerDefaultResourceLimit.requestsMemory') ) {
      errors.push(intl.t('newContainer.errors.quotaRequired', { key: intl.t('formResourceQuota.resources.requestsMemory') }));
    }

    return errors;
  },

  actions:      {
    shell() {
      this.modalService.toggleModal('modal-shell', {
        model:         this.pod,
        containerName: this.name
      });
    },

    popoutShell() {
      const projectId = get(this, 'scope.currentProject.id');
      const podId = get(this, 'pod.id');
      const route = this.router.urlFor('authenticated.project.console', projectId);

      const system = get(this, 'pod.node.info.os.operatingSystem') || ''
      let windows = false;

      if (system.startsWith('Windows')) {
        windows = true;
      }

      later(() => {
        window.open(`//${ window.location.host }${ route }?podId=${ podId }&windows=${ windows }&containerName=${ this.name }&isPopup=true`, '_blank', 'toolbars=0,width=900,height=700,left=200,top=200');
      });
    },

    logs() {
      this.modalService.toggleModal('modal-container-logs', {
        model:         this.pod,
        containerName: this.name
      });
    },

    popoutLogs() {
      const projectId = get(this, 'scope.currentProject.id');
      const podId = get(this, 'pod.id');
      const route = this.router.urlFor('authenticated.project.container-log', projectId);

      later(() => {
        window.open(`//${ window.location.host }${ route }?podId=${ podId }&containerName=${ this.name }&isPopup=true`, '_blank', 'toolbars=0,width=900,height=700,left=200,top=200');
      });
    },
  },

});

export default Container;
