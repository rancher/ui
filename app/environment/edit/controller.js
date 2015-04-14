import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  editing: true,

  doneSaving: function() {
    this.send('goToPrevious');
  }
});
