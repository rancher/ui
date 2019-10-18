import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';

const MEMBERS_HEADERS = [
  {
    translationKey: 'newMultiClusterApp.members.table.name',
    name:           'name',
    sort:           ['userPrincipalId', 'groupPrincipalId'],
  },
  {
    translationKey: 'newMultiClusterApp.members.table.type',
    name:           'type',
    sort:           ['displayType'],
  },
];

export default Component.extend({
  globalStore:      service(),

  layout,

  membersHeaders:   MEMBERS_HEADERS,
  sortBy:           '',
  descending:       false,
  excludeMember:    false,
  resource:         null,
  gotError:         null,
  removeMember:     null,
  searchOnlyGroups: false,
  includeLocal:     false,

  actions: {
    addPrincipal(principal) {
      if (principal && this.addAuthorizedPrincipal) {
        this.addAuthorizedPrincipal(principal);
      }
    },
  },

  addAuthorizedPrincipal() {
    throw new Error('add principal handler must be provided!!');
  },
});
