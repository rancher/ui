import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import layout from './template';

export default Component.extend({
  layout,
  registries: null,
  publishImageConfig: alias('selectedModel.publishImageConfig'),
  init(){
    this._super();
    this.get('publishImageConfig').tag||this.set('publishImageConfig.tag','');
  },
});
