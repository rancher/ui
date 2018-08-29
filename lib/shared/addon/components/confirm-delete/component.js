import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { alternateLabel } from 'ui/utils/platform';
import ModalBase from 'ui/mixins/modal-base';
import layout from './template';
import { eachLimit } from 'async';


export default Component.extend(ModalBase, {
  settings:       service(),
  intl:           service(),

  layout,
  classNames:     ['medium-modal'],
  alternateLabel,
  resources:      alias('modalService.modalOpts.resources'),
  didRender() {
    setTimeout(() => {
      try {
        this.$('BUTTON')[0].focus();
      } catch (e) {}
    }, 500);
  },
  actions: {
    confirm() {
      const resources = get(this, 'resources').slice().reverse();

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
          resource.delete().finally(cb);
        }
      });

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

  isClusterRoleTemplateBinding: computed('resources', function() {
    return !!get(this, 'resources').findBy('type', 'clusterRoleTemplateBinding');
  }),

  isSystemProject: computed('resources', function() {
    const project = get(this, 'resources').findBy('type', 'project');

    return project && get(project, 'isSystemProject');
  }),

  hasSystemProjectNamespace: computed('resources', function() {
    const namespaces = get(this, 'resources').filter((resource) => get(resource, 'type') === 'namespace' && get(resource, 'project.isSystemProject'));

    return get(namespaces, 'length') > 0;
  }),

});
