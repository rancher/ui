import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { inject as service } from '@ember/service';
import {
  computed, set, get, observer, setProperties
} from '@ember/object';
import { next } from '@ember/runloop';

const ISTIO_INJECTION = 'istio-injection'
const ENABLED = 'enabled';

export default Component.extend(ModalBase, NewOrEdit, {
  scope: service(),

  layout,
  classNames:    ['large-modal'],
  editing:       true,
  model:         null,

  allNamespaces:           null,
  allProjects:             null,
  tags:                    null,
  beforeSaveModel:         null,
  initAutoInjectionStatus: null,

  originalModel:  alias('modalService.modalOpts'),
  init() {
    this._super(...arguments);

    const orig  = get(this, 'originalModel');
    const clone = orig.clone();

    delete clone.services;

    setProperties(this, {
      model:         clone,
      tags:          (get(this, 'primaryResource.tags') || []).join(','),
      allNamespaces: get(this, 'clusterStore').all('namespace'),
      allProjects:   get(this, 'globalStore').all('project')
        .filterBy('clusterId', get(this, 'scope.currentCluster.id')),
    })

    const labels = get(this, 'primaryResource.labels')

    const enabled = labels && labels[ISTIO_INJECTION] === ENABLED;

    setProperties(this, {
      istioInjection:          enabled,
      initAutoInjectionStatus: enabled
    });
  },

  actions: {
    addTag(tag) {
      const tags = get(this, 'primaryResource.tags') || [];

      tags.addObject(tag);

      set(this, 'tags', tags.join(','));
    },

    updateNsQuota(quota) {
      if ( quota ) {
        set(this, 'primaryResource.resourceQuota', { limit: quota });
      } else {
        set(this, 'primaryResource.resourceQuota', null);
      }
    },

    updateContainerDefault(limit) {
      set(this, 'primaryResource.containerDefaultResourceLimit', limit);
    },

    setLabels(labels) {
      let out = {};

      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      set(this, 'primaryResource.labels', out);
    },

    toggleAutoInject() {
      set(this, 'istioInjection', !get(this, 'istioInjection'));
    },
  },

  projectDidChange: observer('primaryResource.project.id', function() {
    set(this, 'switchingProject', true);
    next(() => {
      set(this, 'switchingProject', false);
    });
    if ( !get(this, 'primaryResource.project.resourceQuota') ) {
      set(this, 'primaryResource.resourceQuota', null);
    }
  }),

  tagsDidChanged: observer('tags', function() {
    set(this, 'primaryResource.tags', get(this, 'tags').split(',') || []);
  }),

  canMoveNamespace: computed('primaryResource.actionLinks.{move}', function() {
    return !!get(this, 'primaryResource.actionLinks.move');
  }),

  projectLimit: computed('primaryResource.resourceQuota.{limit}', 'primaryResource.projectId', function() {
    const projectId = get(this, 'primaryResource.projectId');
    const project   = get(this, 'allProjects').findBy('id', projectId);

    return get(project, 'resourceQuota.limit');
  }),

  projectUsedLimit: computed('primaryResource.resourceQuota.{limit}', 'primaryResource.projectId', function() {
    const projectId = get(this, 'primaryResource.projectId');
    const project   = get(this, 'allProjects').findBy('id', projectId);

    return get(project, 'resourceQuota.usedLimit');
  }),

  nsDefaultQuota: computed('primaryResource.resourceQuota.{limit}', 'primaryResource.projectId', function() {
    const projectId = get(this, 'primaryResource.projectId');
    const project   = get(this, 'allProjects').findBy('id', projectId);

    return get(project, 'namespaceDefaultResourceQuota.limit');
  }),

  validate() {
    this._super();

    const errors      = get(this, 'errors') || [];
    const quotaErrors = get(this, 'primaryResource').validateResourceQuota(get(this, 'originalModel.resourceQuota.limit'));

    if ( quotaErrors.length > 0 ) {
      errors.pushObjects(quotaErrors);
    }

    set(this, 'errors', errors);

    return get(this, 'errors.length') === 0;
  },

  willSave() {
    const labels = { ...get(this, 'primaryResource.labels') };

    if ( get(this, 'scope.currentCluster.istioEnabled') ) {
      if ( get(this, 'istioInjection') ) {
        labels[ISTIO_INJECTION] = ENABLED;
      } else {
        delete labels[ISTIO_INJECTION];
      }
    }

    setProperties(this, {
      'beforeSaveModel':        get(this, 'originalModel').clone(),
      'primaryResource.labels': labels
    });

    return this._super(...arguments);
  },

  didSave(pr) {
    const { projectId } = pr;

    if ( projectId !== get(this, 'beforeSaveModel.projectId') ) {
      return pr.doAction('move', { projectId }).then((pr) => pr);
    }
  },

  doneSaving() {
    this.send('cancel');
  }
});
