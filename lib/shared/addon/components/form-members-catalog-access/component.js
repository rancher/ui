import Component from '@ember/component';
import layout from './template';
import { get } from '@ember/object';
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

  actions: {
    addPrincipal(principal) {
      if (principal) {
        const { principalType, id } = principal;

        const nue = {
          type:        'member',
          displayType: get(principal, 'displayType') || principalType,
          displayName: get(principal, 'displayName') || get(principal, 'loginName') || get(principalType, 'id'),
          principalType,
          id,
        };

        this.addAuthorizedPrincipal(nue);
      }
    },
  },

  addAuthorizedPrincipal() {
    throw new Error('add principal handler must be provided!!');
  },
});
