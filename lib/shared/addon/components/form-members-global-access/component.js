import Component from '@ember/component';
import layout from './template';
import { set } from '@ember/object';
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
  globalStore:            service(),

  layout,

  membersHeaders:         MEMBERS_HEADERS,
  sortBy:                 '',
  descending:             false,
  ownerOnly:              false,
  resource:               null,
  addAuthorizedPrincipal: null,
  gotError:               null,
  removeMember:           null,
  optionsForAccessType:   null,

  init() {
    this._super(...arguments);

    if (!this.ownerOnly) {
      this.initOptionsForMembersAccessType();
    }
  },

  initOptionsForMembersAccessType() {
    set(this, 'optionsForAccessType', this.globalStore.getById('schema', 'member').optionsFor('accessType') || []);

    return;
  },
});
