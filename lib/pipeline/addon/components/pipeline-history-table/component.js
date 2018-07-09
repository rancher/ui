import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Component.extend({
  prefs:        service(),
  modalService: service('modal'),
  stickyHeader: false,
  activity:     null,
  sortBy:       'name',
  body:         null,
  expandFn(/* item*/) {
    // item.toggleProperty('expanded');
  },
  filtered: function(){

    return get(this, 'body')

  }.property('body'),
  actions: {
    sendAction(model, action) {

      return model.send(action)

    },
  },
});
