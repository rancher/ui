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
    this.set('model.runAsUser', this.get('model.runAsUser') || this.get('authzStore').createRecord({
      type: 'runAsUserStrategyOptions',
      rule: 'RunAsAny',
    }));
  },

  actions: {
    add: function() {
      this.get('model.runAsUser.ranges').pushObject(
        this.get('authzStore').createRecord({
          type: 'idRange',
          min: 1,
          max: 6,
        })
      );
    },
    remove: function(obj) {
      this.get('model.runAsUser.ranges').removeObject(obj);
    },
  },

  ruleDidChange: function() {
    const rule = this.get('model.runAsUser.rule');
    if (rule === 'MustRunAs') {
      this.set('model.runAsUser.ranges', []);
      this.send('add');
    } else {
      this.set('model.runAsUser.ranges', null);
    }
  }.observes('model.runAsUser.rule'),

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
