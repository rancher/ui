import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import { next } from '@ember/runloop';

export default Component.extend({
  layout,

  classNames: ['row'],

  multiClusterApp: null,

  didReceiveAttrs() {
    let { roles } = this.multiClusterApp;

    if (!roles || roles.length === 0) {
      next(() => {
        this.addRole('project-member', '');
      });
    }
  },

  role: computed('multiClusterApp.roles.[]', {
    get() {
      let { roles = [] } = this.multiClusterApp;

      return roles.find((role) => role === 'project-member' || role === 'cluster-owner');
    },
    set(key, value) {
      this.addRole(value, this.role);

      return value;
    }
  }),

  otherRoles: computed('multiClusterApp.roles.[]', function() {
    let { roles = [] } = this.multiClusterApp;

    return roles.filter((role) => role !== 'cluster-owner' && role !== 'project-member');
  }),
});
