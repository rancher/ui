import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  needs: ['hosts/new'],

  validate: function() {
    return this._super();
  },

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
