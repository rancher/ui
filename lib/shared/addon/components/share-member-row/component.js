import Errors from 'ui/utils/errors';
import Component from '@ember/component';
import layout from './template';
import { set } from '@ember/object';

const BASIC_ROLES = [
  {
    label:      'Owner',
    value:      'owner',
  },
  {
    label:      'Member',
    value:      'member',
  },
  {
    label: 'Read Only',
    value: 'read-only',
  }
];

export default Component.extend({
  layout,

  choices:         BASIC_ROLES,
  tagName:         '',
  member:          null,
  editing:         true,
  clusterResource: null,
  users:           null,

  actions: {
    gotError(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },
    addAuthorized(principal) {
      if (principal) {
        let { principalType, id } = principal;

        if (principalType === 'user') {
          set(this, 'member.userPrincipalId', id);
        } else if (principalType === 'group') {
          set(this, 'member.groupPrincipalId', id);
        }
      }
    },
    remove() {
      this.remove(this.member);
    },
  },

  remove() {
    throw new Error('remove is a required action!')
  },

});
