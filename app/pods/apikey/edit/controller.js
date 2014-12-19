import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  queryParams: ['justCreated'],
  justCreated: false,
  cancelAsClose: Ember.computed.alias('justCreated'),

  doneSaving: function() {
    this.transitionToRoute('apikeys');
  }
});
