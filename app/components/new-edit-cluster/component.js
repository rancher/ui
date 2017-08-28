import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  editing: true,
  primaryResource: Ember.computed.alias('cluster'),

  cluster: null,
  createProject: null,

  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  didSave() {
    let project = this.get('createProject');
    if ( project ) {
      project.set('clusterId', this.get('model.id'));
      return project.save();
    }
  },

  doneSaving: function() {
    this.send('cancel');
  }
});
