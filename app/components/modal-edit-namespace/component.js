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

export default Component.extend(ModalBase, NewOrEdit, {
  scope: service(),

  layout,
  classNames:    ['large-modal'],
  editing:       true,
  model:         null,

  allNamespaces:     null,
  allProjects:       null,
  tags:              null,

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

  doneSaving() {
    this.send('cancel');
  }
});
