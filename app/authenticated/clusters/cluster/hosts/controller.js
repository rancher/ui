import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { headersCluster as hostHeaders } from 'shared/components/host-row/component';

export default Controller.extend({
  prefs:             service(),
  scope:             service(),
  projectController: controller('authenticated.project'),

  sortBy:            'name',
  queryParams:       ['sortBy'],
  expandedHosts:     null,
  searchText:        '',
  headers:           hostHeaders,

  init() {
    this._super(...arguments);
    this.set('expandedHosts',[]);
  },

  extraSearchFields: [
    'displayUserLabelStrings',
    'requireAnyLabelStrings',
  ],
});
