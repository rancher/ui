import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  model:      null,
  otherRoles: null,
  choices:    null,
  readOnly:   null,

  tagName:    'TR',
  classNames: 'main-row',

  init() {
    this._super(...arguments);
    const otherRoles = this.get('otherRoles');

    this.set('choices', otherRoles.map((role) => {
      return {
        label: role.name,
        value: role.id,
      };
    }).sortBy('label'));
  },
  actions: {
    remove() {
      this.remove(this.model);
    }
  },

  remove() {
    throw new Error('remove action is required!');
  }
});
