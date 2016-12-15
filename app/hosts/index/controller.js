import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  prefs: Ember.inject.service(),

  mode        : 'grouped',
  queryParams : ['mode'],

  actions: {
    newContainer(hostId) {
      this.transitionToRoute('containers.new', {queryParams: {hostId: hostId}});
    },

  },

  showSystem: Ember.computed(`prefs.${C.PREFS.SHOW_SYSTEM}`, {
    get() {
      return this.get(`prefs.${C.PREFS.SHOW_SYSTEM}`) !== false;
    },

    set(key, value) {
      this.set(`prefs.${C.PREFS.SHOW_SYSTEM}`, value);
      return value;
    }
  }),

  show: Ember.computed('showSystem', function() {
    return this.get('showSystem') === false ? 'standard' : 'all';
  }),

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
