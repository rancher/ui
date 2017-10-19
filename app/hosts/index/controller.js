import Ember from 'ember';
import C from 'ui/utils/constants';
import { headersWithoutHost as containerHeaders } from 'ui/components/container-table/component';
import { headersProject as hostHeaders } from 'ui/components/host-row/component';

export default Ember.Controller.extend({
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),
  projectController: Ember.inject.controller('authenticated.project'),

  mode: 'list',
  sortBy: 'name',
  queryParams: ['mode','sortBy'],
  expandedHosts: null,
  searchText: '',

  containerHeaders: containerHeaders,

  init() {
    this._super(...arguments);
    this.set('expandedHosts',[]);

    Ember.run.scheduleOnce('afterRender', () => {
      let key = `prefs.${C.PREFS.HOST_VIEW}`;
      let mode = this.get(key) || this.get('mode');
      this.transitionToRoute({queryParams: {mode}});
    });
  },

  actions: {
    newContainer(hostId) {
      this.transitionToRoute('containers.run', {queryParams: {hostId: hostId}});
    },

    toggleExpand(hostId) {
      let list = this.get('expandedHosts');
      if ( list.includes(hostId) ) {
        list.removeObject(hostId);
      } else {
        list.addObject(hostId);
      }
    },
  },

  headers: hostHeaders,

  extraSearchFields: [
    'displayUserLabelStrings',
    'requireAnyLabelStrings',
  ],

  extraSearchSubFields: [
  ],

  modeChanged: function() {
    let key = `prefs.${C.PREFS.HOST_VIEW}`;
    let cur = this.get(key);
    let neu = this.get('mode');
    if ( cur !== neu ) {
      this.set(key,neu);
    }
  }.observes('mode'),
});
