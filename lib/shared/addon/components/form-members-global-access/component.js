import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
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
  {
    translationKey: 'newMultiClusterApp.members.table.accessType',
    name:           'accessType',
    sort:           ['accessType'],
  },
];

export default Component.extend({
  globalStore:          service(),

  layout,

  membersHeaders:       MEMBERS_HEADERS,
  sortBy:               '',
  descending:           false,
  excludeMember:        false,
  resource:             null,
  gotError:             null,
  removeMember:         null,
  optionsForAccessType: null,

  init() {
    this._super(...arguments);

    this.initOptionsForMembersAccessType();
  },

  actions: {
    addPrincipal(principal) {
      if (principal) {
        const { principalType, id } = principal;

        const nue = {
          type:        'member',
          accessType:  null,
          displayType: get(principal, 'displayType') || principalType,
          displayName: get(principal, 'displayName') || get(principal, 'loginName') || get(principalType, 'id'),
        };

        if (principalType === 'group') {
          set(nue, 'groupPrincipalId', id);
        } else if (principalType === 'user') {
          set(nue, 'userPrincipalId', id);
        }

        this.addAuthorizedPrincipal(nue);
      }
    },
  },

  addAuthorizedPrincipal() {
    throw new Error('add principal handler must be provided!!');
  },

  initOptionsForMembersAccessType() {
    let accessTypes = this.optionsForAccessType || this.globalStore.getById('schema', 'member').optionsFor('accessType');

    return set(this, 'optionsForAccessType', accessTypes);
  },
});
