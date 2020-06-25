import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { observer, get, set } from '@ember/object';

export default Component.extend({
  globalStore: service(),
  layout,

  classNames: ['accordion-wrapper'],


  model:       null,
  readOnly:    false,
  statusClass: null,
  status:      null,

  init() {
    this._super(...arguments);
    set(this, 'model.runAsGroup', get(this, 'model.runAsGroup') || get(this, 'globalStore').createRecord({
      type: 'runAsGroupStrategyOptions',
      rule: 'RunAsAny',
    }));
  },

  didReceiveAttrs() {
    if (!get(this, 'expandFn')) {
      set(this, 'expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  actions: {
    add() {
      get(this, 'model.runAsGroup.ranges').pushObject(
        get(this, 'globalStore').createRecord({
          type: 'idRange',
          min:  1,
          max:  6,
        })
      );
    },
    remove(obj) {
      get(this, 'model.runAsGroup.ranges').removeObject(obj);
    },
  },

  ruleDidChange: observer('model.runAsGroup.rule', function() {
    const rule = get(this, 'model.runAsGroup.rule');

    if (rule === 'MustRunAs' || rule === 'MayRunAs') {
      set(this, 'model.runAsGroup.ranges', []);
      this.send('add');
    } else {
      set(this, 'model.runAsGroup.ranges', null);
    }
  }),

});
