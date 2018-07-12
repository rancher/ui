import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import layout from './template';
import { set, get } from '@ember/object';

export default Component.extend({
  layout,
  registries:         null,
  publishImageConfig: alias('selectedModel.publishImageConfig'),
  init(){

    this._super();
    get(this, 'publishImageConfig').tag || set(this, 'publishImageConfig.tag', '');

  },
});
