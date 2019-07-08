import Component from '@ember/component';
import layout from './template';
import { computed, get } from '@ember/object';

const MEMBERS_HEADERS = [
  {
    translationKey: 'formShareMember.table.headers.name',
    name:           'name',
    sort:           ['userPrincipalId', 'groupPrincipalId'],
  },
  {
    translationKey: 'formShareMember.table.headers.accessType',
    name:           'accessType',
    sort:           ['accessType'],
  },
];


export default Component.extend({
  layout,

  membersHeaders: MEMBERS_HEADERS,
  sortBy:         '',
  descending:     false,
  resource:       null,
  gotError:       null,
  users:          null,
  errors:         null,

  actions: {
    addMember() {
      this.addAuthorizedPrincipal({
        type:        'member',
        accessType:  'read-only',
      });
    },
    sharePublic() {
      this.addAuthorizedPrincipal({
        type:             'member',
        accessType:       'read-only',
        groupPrincipalId: '*',
      });
    },
  },

  membersRows: computed('resource.members.[]', function() {
    let { members = [] } = this.resource;

    return members.filter((member) => get(member, 'groupPrincipalId') !== '*').sortBy('displayName');
  }),

  publicRow: computed('resource.members.[]', function() {
    let { members = [] } = this.resource;

    return members.filter((member) => get(member, 'groupPrincipalId') === '*');
  }),

  allRows: computed('publicRow', 'membersRows.[]', function() {
    return [...this.publicRow, ...this.membersRows];
  }),

  addAuthorizedPrincipal() {
    throw new Error('add principal handler must be provided!!');
  },

  removeMember() {
    throw new Error('removeMember is a required action!')
  },

});
