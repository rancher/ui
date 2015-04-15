import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  error: null,
  editing: false,

  doneSaving: function() {
    return this.transitionToRoute('environment', this.get('primaryResource.id'));
  },
});
