import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend({
  layout,
  tagName:            'div',
  classNames:         ['box'],
  requestedClusterId: null,
  requestedRoles:     null,
  defaultExpand:      null,
  actions: {
    addRole(role) {
      let roles = (get(this, 'requestedRoles')||[]).slice();

      if (roles.includes(role)) {
        roles = roles.without(role);
      } else {
        roles.addObject(role);
      }

      set(this, 'requestedRoles', roles);
    }
  },
});
