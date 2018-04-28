import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Component.extend({
  prefs: service(),
  modalService: service('modal'),
  stickyHeader: false,
  activity: null,
  sortBy: 'name',
  body: null,
  filtered: function(){
    return get(this, 'body')
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
