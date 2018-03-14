import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  prefs: service(),
  modalService: service('modal'),
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
