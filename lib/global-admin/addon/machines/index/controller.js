import { headersGlobal } from 'shared/components/node-row/component';
import Controller from '@ember/controller'
import { inject as service } from '@ember/service';

export default Controller.extend({
  headers: headersGlobal,
  sortBy: 'name',
  scope: service(),
});
