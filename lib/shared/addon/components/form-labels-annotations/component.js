import { next } from '@ember/runloop';
import { get, set, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import {
  STATUS,
  STATUS_INTL_KEY,
  classForStatus
} from 'shared/components/accordion-list-item/component';
import layout from './template';
import C from 'ui/utils/constants';
import $ from 'jquery';

export default Component.extend(ManageLabels, {
  intl: service(),

  layout,
  classNames: ['accordion-wrapper'],

  detailKey:           'formLabelsAnnotations.detail',
  annotationsCount:    0,
  labelsCount:         0,
  expandAll:           null,
  editing:             true,
  readonlyLabels:      null,
  readonlyAnnotations: null,

  // Inputs
  initialLabels: null,

  model: null,

  statusClass:       null,
  init() {
    this._super(...arguments);

    this.initLabelsAndAnnotations();
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

        $('.js-label.key').last()[0].focus();
      });
    },
    annotationsChange(annotations){
      set(this, 'annotationsCount', Object.keys(annotations).length)
      set(this, 'model.annotations', annotations);
    }
  },

  observeLabelCount: observer('userLabelArray.@each.key', function() {
    let count = this.get('userLabelArray').filterBy('key')
      .get('length') || 0;

    this.set('labelsCount', count || 0);
  }),

  status: computed('labelsCount', 'annotationsCount', function() {
    let k = STATUS.NONE;
    let annotationsCount = this.get('annotationsCount');
    let labelsCount = this.get('labelsCount');
    let count = labelsCount + annotationsCount

    if ( count ) {
      k = STATUS.COUNTCONFIGURED;
    }

    this.set('statusClass', classForStatus(k));

    return this.get('intl').t(`${ STATUS_INTL_KEY }.${ k }`, { count });
  }),

  initLabelsAndAnnotations() {
    const readonlyLabels = get(this, 'readonlyLabels') || [];
    let readonlyAnnotations = get(this, 'readonlyAnnotations') || [];

    Object.keys((get(this, 'initialLabels') || {})).forEach((key) => {
      if ( C.LABEL_PREFIX_TO_IGNORE.find((L) => key.startsWith(L))) {
        readonlyLabels.push(key);
      }
    })

    Object.keys((get(this, 'model.annotations') || {})).forEach((key) => {
      if ( C.ANNOTATIONS_TO_IGNORE_PREFIX.find((L) => key.startsWith(L)) || C.ANNOTATIONS_TO_IGNORE_CONTAINS.find((L) => key.indexOf(L) > -1)) {
        readonlyAnnotations.push(key);
      }
    })

    set(this, 'readonlyAnnotations', readonlyAnnotations);

    this.initLabels(this.get('initialLabels'), 'user', null, readonlyLabels, this.k3sLabelsToIgnore);
    this.labelsChanged();
    this.initCounts();
  },

  initCounts(){
    let labels = this.get('model.labels');
    let annotations = this.get('model.annotations');

    this.set('labelsCount', labels && Object.keys(labels).length || 0);
    this.set('annotationsCount', annotations && Object.keys(annotations).length || 0);
  },
  updateLabels(labels) {
    if (this.setLabels) {
      this.setLabels(labels);
    } else if ( get(this, 'editing') ) {
      const out = {};

      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      set(this, 'model.labels', out);
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
