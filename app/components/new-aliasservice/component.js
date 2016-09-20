import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import NewServiceAlias from 'ui/mixins/new-service-alias';

export default Ember.Component.extend(NewOrEdit, NewServiceAlias, {

  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },


  didInsertElement() {
    this.$('INPUT')[0].focus();
  },

  doneSaving() {
    this.send('done');
  },
});
