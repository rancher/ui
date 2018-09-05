import C from 'ui/utils/constants';
import {  get, set, observer } from '@ember/object';
import Component from '@ember/component';
import { next } from '@ember/runloop';
import layout from './template';

export default Component.extend({
  layout,

  resourceChoices:    null,
  allResourceChoices: null,

  init() {
    this._super(...arguments);
    this.initResourceChoices();
  },

  currentQuotaDidChange: observer('currentQuota.@each.key', function() {
    set(this, 'resourceChoices', get(this, 'allResourceChoices').filter((choice) => this.doesExist(choice)));
  }),

  doesExist(choice) {
    return get(choice, 'value') === get(this, 'quota.key') || !(get(this, 'currentQuota') || []).findBy('key', get(choice, 'value'));
  },

  initResourceChoices() {
    const choices = [];

    C.RESOURCE_QUOTAS.forEach((key) => {
      choices.push({
        label: `formResourceQuota.resources.${ key }`,
        value: key,
      });
    });

    set(this, 'allResourceChoices', choices);

    set(this, 'resourceChoices', choices.filter((choice) => this.doesExist(choice)));

    if ( get(this, 'resourceChoices.length') && !get(this, 'quota.key') ) {
      next(() => {
        set(this, 'quota.key', get(this, 'resourceChoices.firstObject.value'));
      });
    }
  }
});