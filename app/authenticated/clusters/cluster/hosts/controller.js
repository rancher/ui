import Ember from 'ember';
import { headersCluster as hostHeaders } from 'ui/components/host-row/component';

export default Ember.Controller.extend({
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),
  projectController: Ember.inject.controller('authenticated.project'),

  sortBy: 'name',
  queryParams: ['sortBy'],
  expandedHosts: null,
  searchText: '',

  init() {
    this._super(...arguments);
    this.set('expandedHosts',[]);
  },

  headers: hostHeaders,

  extraSearchFields: [
    'displayUserLabelStrings',
    'requireAnyLabelStrings',
  ],
});
