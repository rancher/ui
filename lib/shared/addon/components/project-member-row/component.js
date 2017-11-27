import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  member: null,
  roles: null,

  tagName: 'TR',
  classNames: 'main-row',

  actions: {
    remove: function () {
      this.sendAction('remove', this.get('member'));
    }
  },

  init: function () {
    this._super(...arguments);
    this.set('choices', this.get('roles').map(role => {
      return {
        label: role.name,
        value: role.id,
      };
    }));
  },

  kind: function () {
    return `projectsPage.new.form.members.${this.get('member.subjectKind').toLowerCase()}`
  }.property('member.subjectKind')
});
