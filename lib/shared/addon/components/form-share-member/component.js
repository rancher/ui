import Component from '@ember/component';
import layout from './template';
import { computed, get, set } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';

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

  membersHeaders:  MEMBERS_HEADERS,
  sortBy:          '',
  descending:      false,
  resource:        null,
  gotError:        null,
  users:           null,
  errors:          null,
  editing:         false,
  addPublicMember: false,

  init() {
    this._super(...arguments);

    scheduleOnce('afterRender', () => {
      let { members = [] } = this.resource;

      if (!this.addPublicMember && (members || []).findBy('groupPrincipalId', '*')) {
        set(this, 'addPublicMember', true);
      }
    });
  },

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
    checkboxToggled() {
      let { members = [] } = this.resource;

      if (this.addPublicMember && members.findBy('groupPrincipalId', '*')) {
        this.removeMember(members.findBy('groupPrincipalId', '*'));
      } else {
        this.send('sharePublic');
      }
    },
  },

  membersRows: computed('resource.members.[]', function() {
    let { members = [] } = this.resource;

    return ( members || [] ).filter((member) => get(member, 'groupPrincipalId') !== '*').sortBy('displayName');
  }),

  addAuthorizedPrincipal() {
    throw new Error('add principal handler must be provided!!');
  },

  removeMember() {
    throw new Error('removeMember is a required action!')
  },

});
