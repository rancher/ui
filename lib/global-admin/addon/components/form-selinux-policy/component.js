import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { observer } from '@ember/object';

export default Component.extend({
  globalStore: service(),
  layout,

  classNames: ['accordion-wrapper'],

  model:    null,
  readOnly: false,

  statusClass:   null,
  status:        null,
  init() {
    this._super(...arguments);
    this.set('model.seLinux', this.get('model.seLinux') || this.get('globalStore').createRecord({
      type: 'seLinuxStrategyOptions',
      rule: 'RunAsAny',
    }));
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  ruleDidChange: observer('model.seLinux.rule', function() {
    const rule = this.get('model.seLinux.rule');

    if (rule === 'RunAsAny') {
      this.set('model.seLinux.seLinuxOptions', null);
    } else {
      if (!this.get('model.seLinux.seLinuxOptions')){
        this.set('model.seLinux.seLinuxOptions', this.get('globalStore').createRecord({
          type:  'seLinuxOptions',
          level: '',
          role:  '',
          user:  '',
        }));
      }
    }
  }),

});
