import { headersGlobal } from 'shared/components/node-row/component';
import Controller from '@ember/controller'

export default Controller.extend({
  headers: headersGlobal,
  sortBy: 'name',
});
