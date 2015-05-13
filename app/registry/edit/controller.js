import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  editing: true,
  isCustom: true,
  primaryResource: Ember.computed.alias('model.credential'),

  doneSaving: function() {
    this.transitionToRoute('registries');
  }
});
