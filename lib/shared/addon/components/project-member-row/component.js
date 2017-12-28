import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import { get, set } from '@ember/object';

export default Component.extend({
  layout,
  tagName:    'TR',
  classNames: 'main-row',

  member:     null,
  roles:      null,

  actions: {
    remove: function () {
      this.sendAction('remove', get(this,'member'));
    }
  },

  init: function () {
    this._super(...arguments);
    set(this, 'choices', get(this,'roles').map(role => {
      return {
        label: role.name,
        value: role.id,
      };
    }));
  },

  userList:   computed('users.[]', function() {
    return (get(this, 'users')||[]).map(( user ) =>{ return {label: get(user, 'name'), value: get(user, 'id')} });
  }),

  kind: computed('member.subjectKind', function () {
    return `projectsPage.new.form.members.${get(this,'member.subjectKind').toLowerCase()}`
  })
});
