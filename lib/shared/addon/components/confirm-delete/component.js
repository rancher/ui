import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { alternateLabel } from 'ui/utils/platform';
import ModalBase from 'ui/mixins/modal-base';
import layout from './template';
import { eachLimit } from 'async';
import C from 'ui/utils/constants';
import $ from 'jquery';

function hasSomeOfResourceType(resourceType) {
  return get(this, 'resources')
    .some((resource) => get(resource, 'type') === resourceType);
}

export default Component.extend(ModalBase, {
  settings:       service(),
  intl:           service(),

  layout,
  classNames:       ['medium-modal'],
  alternateLabel,
  forceDelete:      false,
  resources:        alias('modalService.modalOpts.resources'),
  onDeleteFinished:          alias('modalService.modalOpts.onDeleteFinished'),
  didRender() {
    setTimeout(() => {
      try {
        $('BUTTON')[0].focus();
      } catch (e) {}
    }, 500);
  },
  actions: {
    confirm() {
      const resources = get(this, 'resources').slice().reverse();
      const onDeleteFinished = get(this, 'onDeleteFinished') || (() => {});

      eachLimit(resources, 5, (resource, cb) => {
        if ( !resource ) {
          return cb();
        }

        if ( resource.cb ) {
          const out = resource.cb();

          if ( out && out.finally ) {
            out.finally(cb);
          } else {
            cb();
          }

          return;
        } else {
          if ( get(this, 'forceDelete') ) {
            resource.delete({ url: `${ resource.linkFor('remove') }?gracePeriodSeconds=0` } ).finally(cb);
          } else {
            resource.delete().finally(cb);
          }
        }
      }, onDeleteFinished);

      this.send('cancel');
    },
  },

  showProtip: computed('modalService.modalOpts.showProtip', function() {
    let show = get(this, 'modalService.modalOpts.showProtip');

    if ( show === undefined ) {
      show = true;
    }

    return show;
  }),

  isEnvironment: computed('resources', function() {
    return !!get(this, 'resources').findBy('type', 'project');
  }),

  isCluster: computed('resources', function() {
    return !!get(this, 'resources').findBy('type', 'cluster');
  }),

  isPod: computed('resources', function() {
    return !!get(this, 'resources').findBy('type', 'pod');
  }),

  isClusterRoleTemplateBinding: computed('resources', function() {
    return !!get(this, 'resources').findBy('type', 'clusterRoleTemplateBinding');
  }),

  isGlobalRole: computed('resources', function() {
    return !!get(this, 'resources').findBy('type', 'globalRole');
  }),

  isSystemProject: computed('resources', function() {
    const project = get(this, 'resources').findBy('type', 'project');

    return project && get(project, 'isSystemProject');
  }),

  isSystemChart: computed('resources', function() {
    const app = get(this, 'resources').findBy('type', 'app') || {};

    return app && C.SYSTEM_CHART_APPS.includes(get(app, 'displayName'))
  }),

  hasSystemProjectNamespace: computed('resources', function() {
    const namespaces = get(this, 'resources').filter((resource) => get(resource, 'type') === 'namespace' && get(resource, 'project.isSystemProject'));

    return get(namespaces, 'length') > 0;
  }),

  hasNamespaceResourceType: computed('resources', function() {
    return hasSomeOfResourceType.call(this, C.RESOURCE_TYPES.NAMESPACE);
  }),

  hasProjectResourceType: computed('resources', function() {
    return hasSomeOfResourceType.call(this, C.RESOURCE_TYPES.PROJECT);
  }),

  hasClusterResourceType: computed('resources', function() {
    return hasSomeOfResourceType.call(this, C.RESOURCE_TYPES.CLUSTER);
  }),

  resourceType: computed('resources', function() {
    if (get(this, 'hasNamespaceResourceType')) {
      return C.RESOURCE_TYPES.NAMESPACE;
    }

    if (get(this, 'hasProjectResourceType')) {
      return C.RESOURCE_TYPES.PROJECT;
    }

    if (get(this, 'hasClusterResourceType')) {
      return C.RESOURCE_TYPES.CLUSTER;
    }

    return null;
  }),
});
