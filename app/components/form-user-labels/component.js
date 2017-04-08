import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-row/component';

export default Ember.Component.extend(ManageLabels, {
  intl: Ember.inject.service(),

  // Inputs
  initialLabels: null,

  classNames: ['accordion'],

  actions: {
    addUserLabel() {
      this._super();
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.key').last()[0].focus();
      });
    }
  },

  init() {
    this._super(...arguments);

    this.initLabels(this.get('initialLabels'),'user');
    this.labelsChanged();
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },


  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = this.get('userLabelArray').filterBy('key').get('length') || 0;

    if ( count ) {
      k = STATUS.COUNTCONFIGURED;
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('userLabelArray.@each.key'),
});
