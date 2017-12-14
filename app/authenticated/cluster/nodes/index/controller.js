import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { headersCluster as hostHeaders } from 'shared/components/node-row/component';

export default Controller.extend({
  prefs:             service(),
  scope:             service(),
  projectController: controller('authenticated.project'),

  sortBy:            'name',
  queryParams:       ['sortBy'],
  searchText:        '',
  headers:           hostHeaders,

  extraSearchFields: [
    'displayUserLabelStrings',
    'requireAnyLabelStrings',
  ],
});
