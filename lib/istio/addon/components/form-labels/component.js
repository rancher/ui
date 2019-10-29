import { next } from '@ember/runloop';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import layout from './template';
import $ from 'jquery';

export default Component.extend(ManageLabels, {
  layout,
  classNames: ['accordion-wrapper'],

  detailKey:      'formUserLabels.detail',
  addActionLabel: 'formUserLabels.addAction',

  // Inputs
  initialLabels: null,

  init() {
    this._super(...arguments);

    this.initLabels(this.get('initialLabels'), 'user', null, this.get('readonlyLabels'));
    this.labelsChanged();
  },

  actions: {
    addUserLabel() {
      this._super();
      next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        $('INPUT.key').last()[0].focus();
      });
    },
  },

  updateLabels(labels) {
    if (this.setLabels) {
      const out = {};

      labels.forEach((label) => {
        if ( label.value ) {
          out[label.key] = label.value
        }
      })
      this.setLabels(out);
    }
  },
});
