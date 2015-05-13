import Ember from 'ember';
import NewHost from 'ui/mixins/new-host';

export default Ember.ObjectController.extend(NewHost, {
  validate: function() {
    return this._super();
  },

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
