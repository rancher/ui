import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  layout,

  classNames: ['accordion-wrapper'],

  authzStore: service('authz-store'),

  model: null,

  init() {
    this._super(...arguments);
    this.set('model.seLinux', this.get('model.seLinux') || this.get('authzStore').createRecord({
      type: 'seLinuxStrategyOptions',
      rule: 'RunAsAny',
    }));
  },

  ruleDidChange: function() {
    const rule = this.get('model.seLinux.rule');
    if (rule === 'RunAsAny') {
      this.set('model.seLinux.seLinuxOptions', null);
    } else {
      this.set('model.seLinux.seLinuxOptions', this.get('authzStore').createRecord({
        type: 'seLinuxOptions',
        level: '',
        role: '',
        user: '',
      }));
    }
  }.observes('model.seLinux.rule'),

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function (item) {
        item.toggleProperty('expanded');
      });
    }
  },

  statusClass: null,
  status: null,
});
