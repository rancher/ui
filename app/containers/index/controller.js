import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  show: 'standard',
  showSystem: null,
  sortBy: 'name',

  queryParams: ['show','sortBy'],

  sorts: {
    state:    ['stateSort','name','id'],
    name:     ['name','id'],
    ip:       ['displayIp','name','id'],
    image:    ['imageUuid','id'],
    command:  ['command','name','id'],
    host:     ['primaryHost.displayName','name','id'],
  },

  // showChanged should be an observer rather then init to correctly set the showSystem checkbox
  // if showSystem is set on init show does not contain the correct qp as the router has not set it
  // so the checkbox never gets set
  showChanged: function() {
    this.set('showSystem', this.get('show') === 'all');
  }.observes('show'),

  showSystemChanged: function() {
    this.set('show', (this.get('showSystem') ? 'all' : 'standard'));
  }.observes('showSystem'),

  sortableContent: Ember.computed.alias('filtered'),
  filtered: function() {
    let all = this.get('model');
    if ( this.get('showSystem') ) {
      return all;
    } else {
      return all.filterBy('isSystem', false);
    }
  }.property('model.@each.system','showSystem'),

});
