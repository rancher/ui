import { observer } from '@ember/object';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import layout from './template';

export default Component.extend(NewOrEdit, {
  layout,
  model: null,

  userValue: '',
  userValueChanged: observer('userValue', function() {
    this.set('primaryResource.value', AWS.util.base64.encode(this.get('userValue')));
  }),

  actions: {
    cancel() {
      this.sendAction('cancel');
    }
  },

  doneSaving() {
    this.sendAction('cancel');
  },
});
