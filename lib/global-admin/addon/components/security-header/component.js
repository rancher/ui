import Component from '@ember/component';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  globalStore: service(),

  layout,

  showAuthHeader: false,

  init() {

    this._super(...arguments);

    const authConfigs = get(this, 'globalStore').all('authConfig');

    set(this, 'showAuthHeader', authConfigs.get('length') > 0);

  },
});
