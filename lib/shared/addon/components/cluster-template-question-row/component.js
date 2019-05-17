import Component from '@ember/component';
import layout from './template';

const TYPES = [{ value: 'string' }, { value: 'multiline' }, { value: 'boolean' }, { value: 'int' }, { value: 'password' }];

export default Component.extend({
  layout,

  tagName:     'tr',
  classNames:  ['main-row'],

  questions:   null,
  question:    null,
  typeOptions: TYPES,

  actions: {
    removeQuestion() {
      this.removeQuestion(this.question);
    }
  },

  removeQuestion() {
    throw new Error('remove override action is required');
  },
});
