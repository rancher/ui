import { computed, get, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import layout from './template';

const HEADERS_WITH_KIND = [
  {
    name:           'kind',
    sort:           ['type', 'key'],
    translationKey: 'labelsSection.kind',
    width:          '90',
  },
  {
    name:           'key',
    sort:           ['key'],
    translationKey: 'labelsSection.key',
    width:          '350',
  },
  {
    name:           'value',
    sort:           ['value', 'key'],
    translationKey: 'labelsSection.value',
  },
];

const HEADERS = [
  {
    name:           'key',
    sort:           ['key'],
    translationKey: 'labelsSection.key',
    width:          '350',
  },
  {
    name:           'value',
    sort:           ['value', 'key'],
    translationKey: 'labelsSection.value',
  },
];

export default Component.extend(ManageLabels, {
  layout,
  model: null,

  sortBy:            'kind',
  translationDetail: 'labelsSection.detail',
  showKind:          true,
  descending:        true,

  labelSource:    alias('model.labels'),

  didReceiveAttrs() {
    this.initLabels(this.get('labelSource'), null, null, this.k3sLabelsToIgnore);
  },

  labelsObserver: observer('model.labels', function() {
    this.initLabels(this.get('labelSource'), null, null, this.k3sLabelsToIgnore);
  }),

  headers: computed('showKind', function() {
    return get(this, 'showKind') ? HEADERS_WITH_KIND : HEADERS;
  }),

});
