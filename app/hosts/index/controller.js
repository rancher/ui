import Ember from 'ember';

export default Ember.Controller.extend({
  mode        : 'grouped',
  show        : 'standard',
  showSystem  : null,
  queryParams : ['mode','show'],

  actions: {
    newContainer: function(hostId) {
      this.transitionToRoute('containers.new', {queryParams: {hostId: hostId}});
    },
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

  listLinkOptions: {
    route: 'hosts',
    options: {
      mode: 'dot',
    },
  },

  groupLinkOptions: {
    route: 'hosts',
    options: {
      mode: 'grouped',
    },
  }
});
