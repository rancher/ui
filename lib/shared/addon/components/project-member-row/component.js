import Component from '@ember/component';
import layout from './template';
import { computed, observer, get, set } from '@ember/object';
import { on } from '@ember/object/evented';

export default Component.extend({
  layout,
  tagName:    'TR',
  classNames: 'main-row',

  member:     null,
  roles:      null,
  owner: null,
  type:  null,

  actions: {
    remove: function () {
      this.sendAction('remove', get(this,'member'));
    }
  },

  init: function () {
    this._super(...arguments);
    set(this, 'choices', get(this,'roles').filterBy('hidden', false).map(role => {
      return {
        label: role.name,
        value: role.id,
      };
    }));
  },

  userList: computed('users.[]', function() {
    return (get(this, 'users')||[]).map(( user ) =>{
      return {
        label: get(user, 'displayName'),
        value: get(user, 'id')
      };
    });
  }),

  kind: computed('member.subjectKind', function () {
    if (get(this, 'owner')) {
      return `projectsPage.new.form.members.${get(this,'owner.type').toLowerCase()}`; // TODO translations
    } else {
      return `projectsPage.new.form.members.${get(this,'member.subjectKind').toLowerCase()}`
    }
  }),

});
