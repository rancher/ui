import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  scope:     service(),
  layout,
  showGroup: true,

  tagName:   '',
  allStacks: null,
  init() {
    this._super(...arguments);
    this.set('allStacks', this.get('store').all('stack'));
  },
});
