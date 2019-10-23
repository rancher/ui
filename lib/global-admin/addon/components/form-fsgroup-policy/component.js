import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { observer } from '@ember/object';

export default Component.extend({
  globalStore: service(),
  layout,

  model:    null,
  readOnly: false,

  classNames: ['accordion-wrapper'],

  statusClass:   null,
  status:        null,
  init() {
    this._super(...arguments);
    this.set('model.fsGroup', this.get('model.fsGroup') || this.get('globalStore').createRecord({
      type: 'fsGroupStrategyOptions',
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

  actions: {
    add() {
      this.get('model.fsGroup.ranges').pushObject(
        this.get('globalStore').createRecord({
          type: 'idRange',
          min:  0,
          max:  6,
        })
      );
    },
    remove(obj) {
      this.get('model.fsGroup.ranges').removeObject(obj);
    },
  },

  ruleDidChange: observer('model.fsGroup.rule', function() {
    const rule = this.get('model.fsGroup.rule');

    if (rule === 'MustRunAs') {
      this.set('model.fsGroup.ranges', []);
      this.send('add');
    } else {
      this.set('model.fsGroup.ranges', null);
    }
  }),

});
