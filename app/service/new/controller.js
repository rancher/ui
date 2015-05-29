import Ember from 'ember';
import EditContainer from 'ui/mixins/edit-container';
import EditService from 'ui/mixins/edit-service';
import EditLabels from 'ui/mixins/edit-labels';

export default Ember.ObjectController.extend(EditContainer, EditService, EditLabels, {
  queryParams: ['environmentId','serviceId','containerId'],
  environmentId: null,
  serviceId: null,
  containerId: null,

  editing: false,

  doneSaving: function() {
    return this.transitionToRoute('environment', this.get('selectedEnvironment.id'));
  },
});
