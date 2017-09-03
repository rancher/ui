import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  projects: Ember.inject.service(),

  editing: true,
  primaryResource: Ember.computed.alias('cluster'),

  cluster: null,

  didInsertElement() {
    let el = this.$('INPUT')[0];
    if ( el ) {
      el.focus();
    }
  },

  actions: {
    done() {
      this.sendAction('done');
    },

    editStack(obj) {
      obj;
    },

    removeStack(obj) {
      this.get('primaryResource.systemStacks').removeObject(obj);
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  didSave() {
    return this.get('primaryResource').waitForTransition().then(() => {
      return this.get('projects').refreshAll();
    });
  },

  doneSaving() {
    this.send('cancel');
  }
});
