import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditService from 'ui/mixins/edit-service';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditService, {
  editing: true,

  doneSaving: function() {
    this.send('goToPrevious');
  }
});
