import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Controller.extend(NewOrEdit, {
  queryParams: ['justCreated'],
  justCreated: false,
  cancelAsClose: Ember.computed.alias('justCreated'),

  doneSaving: function() {
    this.transitionToRoute('apikeys');
  }
});
