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
    this.set('model.supplementalGroups', this.get('model.supplementalGroups') || this.get('globalStore').createRecord({
      type: 'supplementalGroupsStrategyOptions',
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
      this.get('model.supplementalGroups.ranges').pushObject(
        this.get('globalStore').createRecord({
          type: 'idRange',
          min:  0,
          max:  6,
        })
      );
    },
    remove(obj) {
      this.get('model.supplementalGroups.ranges').removeObject(obj);
    },
  },

  ruleDidChange: observer('model.supplementalGroups.rule', function() {
    const rule = this.get('model.supplementalGroups.rule');

    if (rule === 'MustRunAs') {
      this.set('model.supplementalGroups.ranges', []);
      this.send('add');
    } else {
      this.set('model.supplementalGroups.ranges', null);
    }
  }),

});
