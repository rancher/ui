import Ember from 'ember';
import EditProject from 'ui/mixins/edit-project';

export default Ember.ObjectController.extend(EditProject, {
  editing: true,

  didSave: function() {
    return this.get('model').doAction('setmembers',{members: this.get('members')});
  },
});
