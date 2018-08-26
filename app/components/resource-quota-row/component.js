import {  get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { next } from '@ember/runloop';
import layout from './template';

const IGNORED = ['requestsStorage', 'persistentVolumeClaims'];

export default Component.extend({
  globalStore: service(),

  layout,

  tagName:    'TR',
  classNames: 'main-row',

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
    return get(choice, 'value') === get(this, 'quota.key') || !get(this, 'currentQuota').findBy('key', get(choice, 'value'));
  },

  initResourceChoices() {
    const choices = [];
    const schema = get(this, 'globalStore').getById('schema', 'resourcequotalimit');

    if ( schema ) {
      Object.keys(get(schema, 'resourceFields')).filter((key) => IGNORED.indexOf(key) === -1).forEach((key) => {
        choices.push({
          label: `formResourceQuota.resources.${ key }`,
          value: key,
        });
      });
    }

    set(this, 'allResourceChoices', choices);

    set(this, 'resourceChoices', choices.filter((choice) => this.doesExist(choice)));

    if ( get(this, 'resourceChoices.length') && !get(this, 'quota.key') ) {
      next(() => {
        set(this, 'quota.key', get(this, 'resourceChoices.firstObject.value'));
      });
    }
  }
});
