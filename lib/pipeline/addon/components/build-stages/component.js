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

  expandFn() {},

  filtered: computed('body', function(){

    return get(this, 'body');

  }),

  actions: {
    sendAction(model, action) {

      return model.send(action)

    },
  },
});
