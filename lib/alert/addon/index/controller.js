import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service'
import { get, set } from '@ember/object'
import { alias } from '@ember/object/computed'

export default Controller.extend({
  scope: service(),
  pageScope: alias('scope.currentPageScope'),
  alerts: alias('model.alerts'),
  notifiers: alias('model.notifiers'),
});
