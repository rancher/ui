import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditService from 'ui/mixins/edit-service';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditService, {
  editing: true,

  hasScale: function() {
    return this.get('service.type') !== 'dnsService';
  }.property('service.type'),

  doneSaving: function() {
    this.send('goToPrevious');
  }
});
