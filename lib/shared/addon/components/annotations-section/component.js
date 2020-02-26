import { observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import layout from './template';
import C from 'ui/utils/constants';

const K3S_LABELS_TO_IGNORE = [
  C.LABEL.K3S_NODE_ARGS,
  C.LABEL.K3S_NODE_CONFIG_HASH,
  C.LABEL.K3S_NODE_ENV
];

export default Component.extend(ManageLabels, {
  layout,
  model: null,

  sortBy:           'key',
  descending:       false,

  headers: [
    {
      name:           'key',
      sort:           ['key'],
      translationKey: 'annotationsSection.key',
    },
    {
      name:           'value',
      sort:           ['value', 'key'],
      translationKey: 'annotationsSection.value',
    },
  ],

  annotationSource:    alias('model.annotations'),

  didReceiveAttrs() {
    this.initLabels(this.get('annotationSource'), null, null, null, K3S_LABELS_TO_IGNORE);
  },

  annotationsObserver: observer('model.annotations', function() {
    this.initLabels(this.get('annotationSource'), null, null, null, K3S_LABELS_TO_IGNORE);
  }),

});
