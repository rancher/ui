import Ember from 'ember';
import EditContainer from 'ui/mixins/edit-container';
import EditService from 'ui/mixins/edit-service';

export default Ember.ObjectController.extend(EditContainer, EditService, {
  queryParams: ['environmentId','serviceId','containerId'],
  environmentId: null,
  serviceId: null,
  containerId: null,

  editing: false,
  isService: true,

  doneSaving: function() {
    return this.transitionToRoute('environment', this.get('primaryResource.environmentId'));
  },
});
