import {  get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

const IGNORED = ['requestsStorage', 'persistentVolumeClaims'];

export default Component.extend({
  globalStore: service(),

  layout,

  tagName:    'TR',
  classNames: 'main-row',

  resourceChoices: null,

  init() {
    this._super(...arguments);
    this.initResourceChoices();
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

    set(this, 'resourceChoices', choices);
  }
});
