import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import DisplayImage from 'shared/mixins/display-image';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

var Container = Resource.extend(DisplayImage, {
  modalService: service('modal'),
  intl:         service(),
  scope:        service(),
  router:       service(),

  links:        {},
  type:         'container',

  pod: reference('podId'),

  availableActions: computed('state', function() {
    let isRunning = get(this, 'state') === 'running';

    var choices = [
      {
        label:     'action.execute',
        icon:      'icon icon-terminal',
        action:    'shell',
        enabled:   isRunning,
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

  validateQuota() {
    const projectLimit =  get(this, 'scope.currentProject.resourceQuota.limit');

    if ( !projectLimit ) {
      return [];
    }

    const intl = get(this, 'intl');
    const errors = [];

    const {
      limitsCpu, limitsMemory, requestsCpu, requestsMemory
    } = projectLimit;

    if ( limitsCpu && !get(this, `resources.limits.cpu`)) {
      errors.push(intl.t('newContainer.errors.quotaRequired', { key: intl.t('formResourceQuota.resources.limitsCpu') }));
    }
    if ( limitsMemory && !get(this, `resources.limits.memory`)) {
      errors.push(intl.t('newContainer.errors.quotaRequired', { key: intl.t('formResourceQuota.resources.limitsMemory') }));
    }
    if ( requestsCpu && !get(this, `resources.requests.cpu`)) {
      errors.push(intl.t('newContainer.errors.quotaRequired', { key: intl.t('formResourceQuota.resources.requestsCpu') }));
    }
    if ( requestsMemory && !get(this, `resources.requests.memory`)) {
      errors.push(intl.t('newContainer.errors.quotaRequired', { key: intl.t('formResourceQuota.resources.requestsMemory') }));
    }

    return errors;
  },

  actions:      {
    shell() {
      get(this, 'modalService').toggleModal('modal-shell', {
        model:         get(this, 'pod'),
        containerName: get(this, 'name')
      });
    },

    popoutShell() {
      const projectId = get(this, 'scope.currentProject.id');
      const podId = get(this, 'pod.id');
      const route = get(this, 'router').urlFor('authenticated.project.console', projectId);

      const system = get(this, 'pod.node.info.os.operatingSystem') || ''
      let windows = false;

      if (system.startsWith('Windows')) {
        windows = true;
      }

      later(() => {
        window.open(`//${ window.location.host }${ route }?podId=${ podId }&windows=${ windows }&containerName=${ get(this, 'name') }&isPopup=true`, '_blank', 'toolbars=0,width=900,height=700,left=200,top=200');
      });
    },

    logs() {
      get(this, 'modalService').toggleModal('modal-container-logs', {
        model:         get(this, 'pod'),
        containerName: get(this, 'name')
      });
    },

    popoutLogs() {
      const projectId = get(this, 'scope.currentProject.id');
      const podId = get(this, 'pod.id');
      const route = get(this, 'router').urlFor('authenticated.project.container-log', projectId);

      later(() => {
        window.open(`//${ window.location.host }${ route }?podId=${ podId }&containerName=${ get(this, 'name') }&isPopup=true`, '_blank', 'toolbars=0,width=900,height=700,left=200,top=200');
      });
    },
  },

});

export default Container;