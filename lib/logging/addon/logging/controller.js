import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service'
import { get, set } from '@ember/object'
import { reads } from '@ember/object/computed'

export default Controller.extend({
  globalStore: service(),

  queryParams: ['targetType'],
  targetType: 'none',

  init(...args) {
    this._super(...args);
  },
});
