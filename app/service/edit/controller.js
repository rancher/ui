import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditService from 'ui/mixins/edit-service';
import C from 'ui/utils/constants';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, EditService, {
  editing: true,

  canScale: function() {
    if ( ['service','loadbalancerservice'].indexOf(this.get('service.type').toLowerCase()) >= 0 )
    {
      return !this.getLabel(C.LABEL.SCHED_GLOBAL);
    }
    else
    {
      return false;
    }
  }.property('service.type'),

  doneSaving: function() {
    this.send('goToPrevious');
  }
});
