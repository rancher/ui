import Ember from 'ember';
import EditContainer from 'ui/mixins/edit-container';
import EditLabels from 'ui/mixins/edit-labels';

export default Ember.ObjectController.extend(EditContainer, EditLabels, {
  queryParams: ['environmentId','containerId'],
  environmentId: null,
  containerId: null,
  editing: false,
});
