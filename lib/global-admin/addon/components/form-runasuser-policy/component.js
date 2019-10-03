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
    this.set('model.runAsUser', this.get('model.runAsUser') || this.get('globalStore').createRecord({
      type: 'runAsUserStrategyOptions',
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
      this.get('model.runAsUser.ranges').pushObject(
        this.get('globalStore').createRecord({
          type: 'idRange',
          min:  1,
          max:  6,
        })
      );
    },
    remove(obj) {
      this.get('model.runAsUser.ranges').removeObject(obj);
    },
  },

  ruleDidChange: observer('model.runAsUser.rule', function() {
    const rule = this.get('model.runAsUser.rule');

    if (rule === 'MustRunAs') {
      this.set('model.runAsUser.ranges', []);
      this.send('add');
    } else {
      this.set('model.runAsUser.ranges', null);
    }
  }),

});
