import Ember from 'ember';
import EditContainer from 'ui/mixins/edit-container';

export default Ember.ObjectController.extend(EditContainer, {
  queryParams: ['environmentId','containerId'],
  environmentId: null,
  containerId: null,
  editing: false,
});
