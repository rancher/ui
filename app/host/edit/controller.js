import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditLabels from 'ui/mixins/edit-labels';

export default Ember.ObjectController.extend(Cattle.LegacyNewOrEditMixin, EditLabels, {
  editing: true,

  doneSaving: function() {
    this.send('goToPrevious');
  }
});
