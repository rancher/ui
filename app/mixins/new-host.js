import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.Mixin.create(Cattle.NewOrEditMixin,{
  count: null,


  nameParts: function() {
  }.property('name','count')

  nameCountLabel: function() {
  }.property('name','count')

  initField: function() {
    this._super();
    this.set('count', 1);
  }
});
