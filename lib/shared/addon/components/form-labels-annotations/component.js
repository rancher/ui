import { next } from '@ember/runloop';
import {  set } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import {
  STATUS,
  STATUS_INTL_KEY,
  classForStatus
} from 'shared/components/accordion-list-item/component';
import layout from './template';

export default Component.extend(ManageLabels, {
  intl: service(),

  layout,
  classNames: ['accordion-wrapper'],

  detailKey:        'formLabelsAnnotations.detail',
  annotationsCount: 0,
  labelsCount:      0,
  expandAll:        null,
  editing:          true,
  readonlyLabels:   null,

  // Inputs
  initialLabels: null,

  model: null,

  statusClass:       null,
  init() {
    this._super(...arguments);

    this.initLabels(this.get('initialLabels'), 'user', null, this.get('readonlyLabels'));
    this.labelsChanged();
    this.initCounts();
  },
  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  actions: {
    addUserLabel() {
      this._super();
      next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('.js-label.key').last()[0].focus();
      });
    },
    annotationsChange(annotations){
      set(this, 'annotationsCount', Object.keys(annotations).length)
      set(this, 'model.annotations', annotations);
    }
  },

  observeLabelCount: function() {
    let count = this.get('userLabelArray').filterBy('key')
      .get('length') || 0;

    this.set('labelsCount', count || 0);
  }.observes('userLabelArray.@each.key'),

  status: function() {
    let k = STATUS.NONE;
    let annotationsCount = this.get('annotationsCount');
    let labelsCount = this.get('labelsCount');
    let count = labelsCount + annotationsCount

    if ( count ) {
      k = STATUS.COUNTCONFIGURED;
    }

    this.set('statusClass', classForStatus(k));

    return this.get('intl').t(`${ STATUS_INTL_KEY }.${ k }`, { count });
  }.property('labelsCount', 'annotationsCount'),
  initCounts(){
    let labels = this.get('model.labels');
    let annotations = this.get('model.annotations');

    this.set('labelsCount', labels && Object.keys(labels).length || 0);
    this.set('annotationsCount', annotations && Object.keys(annotations).length || 0);
  },
  updateLabels(labels) {
    if (this.setLabels) {
      this.setLabels(labels);
    }

    this.validate();
  },

  validate() {
    let errors = [];

    //    (this.get('labelArray')||[]).forEach((obj) => {
    //    });

    set(this, 'errors', errors);
  },

});
