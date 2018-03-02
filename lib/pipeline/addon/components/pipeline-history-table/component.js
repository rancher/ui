import Ember from 'ember';

export default Ember.Component.extend({
  prefs: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),
  stickyHeader: false,
  activity: null,
  sortBy: 'name',
  body: null,
  filtered: function(){
    return this.get('body')
  }.property('body'),
  expandFn:function(/*item*/) {
    // item.toggleProperty('expanded');
  },
  actions: {
    sendAction: function (model, action) {
      return model.send(action)
    },
  },
});
