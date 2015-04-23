import Ember from 'ember';
import EditProject from 'ui/mixins/edit-project';

export default Ember.ObjectController.extend(EditProject, {
  editing: false,
});
