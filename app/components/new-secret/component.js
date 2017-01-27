import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  model: null,

  userValue: '',
  userValueChanged: Ember.observer('userValue', function() {
    this.set('primaryResource.value', btoa(this.get('userValue')));
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
