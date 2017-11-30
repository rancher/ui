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
    this.set('model.fsGroup', this.get('model.fsGroup') || this.get('authzStore').createRecord({
      type: 'fsGroupStrategyOptions',
      rule: 'RunAsAny',
    }));
  },

  actions: {
    add: function() {
      this.get('model.fsGroup.ranges').pushObject(
        this.get('authzStore').createRecord({
          type: 'idRange',
          min: 0,
          max: 6,
        })
      );
    },
    remove: function(obj) {
      this.get('model.fsGroup.ranges').removeObject(obj);
    },
  },

  ruleDidChange: function() {
    const rule = this.get('model.fsGroup.rule');
    if (rule === 'MustRunAs') {
      this.set('model.fsGroup.ranges', []);
      this.send('add');
    } else {
      this.set('model.fsGroup.ranges', null);
    }
  }.observes('model.fsGroup.rule'),

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
