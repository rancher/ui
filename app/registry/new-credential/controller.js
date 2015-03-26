import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  credentials: null,
  editing: false,

  doneSaving: function() {
    this.transitionToRoute('registry');
  },
});
