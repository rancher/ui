import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';

export default Component.extend({
  prefs:        service(),
  modalService: service('modal'),
  stickyHeader: false,
  activity:     null,
  sortBy:       'name',
  body:         null,

  // actions: {
  //   sendAction(model, action) {
  //     return model.send(action)
  //   },
  // },
  filtered: computed('body', function(){
    return get(this, 'body');
  }),

  expandFn() {},

});
