import Ember from 'ember';
import EditContainer from 'ui/mixins/edit-container';
import EditService from 'ui/mixins/edit-service';

export default Ember.ObjectController.extend(EditContainer, EditService, {
  queryParams: ['environmentId'],
  environmentId: null,

  editing: false,

  doneSaving: function() {
    return this.transitionToRoute('environment', this.get('selectedEnvironment.id'));
  },
});
